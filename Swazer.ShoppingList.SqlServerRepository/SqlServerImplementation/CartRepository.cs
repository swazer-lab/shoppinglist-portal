using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.RepositoryInterface;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.SqlServerRepository
{
    public class CartRepository : ICartRepository
    {
        public QueryResult<CartObject> FetchCards(CartMobileSearchCriteria criteria)
        {
            List<CartObjectDB> carts = new List<CartObjectDB>();

            try
            {
                using (SqlConnection connect = new SqlConnection(ConfigurationManager.ConnectionStrings["CnnStr1"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand())
                    {
                        command.CommandText = @"SELECT c.CartId, c.Title, c.Notes, c.Date, c.Status, co.CartIndex, i.ItemId, i.Title as itemTitle, ci.Status as itemStatus,u.Id as userId, u.Name, u.Email,u.Mobile,u.EmailConfirmed, co.AccessLevel, img.ImageId
FROM Carts as c
INNER JOIN CartOwners AS co ON c.CartId = co.CartId 
LEFT JOIN CartItems AS ci ON ci.CartId = c.CartId
LEFT JOIN Items AS i ON i.ItemId = ci.ItemId
LEFT JOIN Users AS u ON u.Id = co.UserId
LEFT JOIN Images AS img ON img.UserId = u.Id
Where c.CartId IN (
	SELECT cc.CartId FROM Carts AS cc
	INNER JOIN CartOwners AS co ON cc.CartId = co.CartId
	WHERE co.UserId = @UserId AND (@Title is null or cc.Title LIKE '%'+@Title+'%')
	ORDER BY co.CartIndex DESC
	OFFSET @PageSize * (@PageNumber - 1) ROWS
	FETCH NEXT @PageSize ROWS ONLY
)
ORDER BY co.CartIndex DESC";

                        command.Connection = connect;
                        command.Parameters.Add("Title", SqlDbType.VarChar).Value = (object)criteria.Title ?? DBNull.Value;
                        command.Parameters.Add("UserId", SqlDbType.Int).Value = criteria.UserId;

                        command.Parameters.Add("PageSize", SqlDbType.Int).Value = criteria.PageSize;
                        command.Parameters.Add("PageNumber", SqlDbType.Int).Value = criteria.PageNumber;
                        connect.Open();

                        using (SqlDataReader dr = command.ExecuteReader())
                        {
                            while (dr.Read())
                            {
                                CartObjectDB cart = new CartObjectDB();

                                cart.CartId = (int)dr["CartId"];
                                cart.Title = dr["Title"].ToString();
                                cart.Notes = dr["Notes"].ToString();
                                cart.cAR = (int)dr["Status"];
                                cart.Date = dr["Date"] == DBNull.Value ? null : (DateTime?)dr["Date"];
                                cart.CartIndex = (double)dr["CartIndex"];

                                cart.ItemId = dr["ItemId"] == DBNull.Value ? null : (int?)dr["ItemId"];
                                cart.ItemTitle = dr["itemTitle"] == DBNull.Value ? null : dr["itemTitle"].ToString();
                                cart.ItemStatus = dr["itemStatus"] == DBNull.Value ? null : (int?)dr["itemStatus"];

                                cart.UserId = (int)dr["userId"];
                                cart.Name = dr["Name"] == DBNull.Value ? null : dr["Name"].ToString();
                                cart.Email = dr["Email"].ToString();
                                cart.Mobile = dr["Mobile"] == DBNull.Value ? null : dr["Mobile"].ToString();
                                cart.IsConfirmed = (bool)dr["EmailConfirmed"];
                                cart.AccessLevel = (int)dr["AccessLevel"];
                                cart.PhotoId = dr["ImageId"] == DBNull.Value ? null : (int?)dr["ImageId"];

                                carts.Add(cart);
                        }
                        }
                    }
                }

                var returnedCarts = carts.Where(x=>x.CartStatus == (int)CartStatus.NotArchived).GroupBy(x => x.CartId).Select(cart => new CartObject
                {
                    CartId = cart.FirstOrDefault().CartId,
                    Title = cart.FirstOrDefault().Title,
                    CartIndex = cart.FirstOrDefault().CartIndex,
                    Date = cart.FirstOrDefault().Date,
                    Notes = cart.FirstOrDefault().Notes,

                    Users = cart.GroupBy(y => y.UserId).Select(user => new UserObject
                    {
                        UserId = user.FirstOrDefault().UserId,
                        Name = user.FirstOrDefault().Name,
                        Email = user.FirstOrDefault().Email,
                        IsConfirmed = user.FirstOrDefault().IsConfirmed,
                        AccessLevel = (AccessLevel)user.FirstOrDefault().AccessLevel,
                        Mobile = user.FirstOrDefault().Mobile,
                        PhotoId = user.FirstOrDefault().PhotoId
                    }).ToList(),

                    Items = cart.GroupBy(y => y.UserId).Select(user => user.Select(item => new CartItemObject
                    {
                        ItemId = item?.ItemId,
                        Title = item?.ItemTitle,
                        Status = (ItemStatus?)item.ItemStatus
                    })).FirstOrDefault().ToList()
                }).ToList();

                int totalCount = CalculateTotalCount(criteria.UserId);

                return new QueryResult<CartObject>(returnedCarts, totalCount);
            }

            catch (Exception ex)
            {
                return null;
            }
        }

        private int CalculateTotalCount(int userId)
        {
            try
            {
                using (SqlConnection connect = new SqlConnection(ConfigurationManager.ConnectionStrings["CnnStr1"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand())
                    {
                        command.CommandText = @"SELECT COUNT(*) as CartCount FROM dbo.CartOwners co
                            WHERE co.UserId = @UserId";

                        command.Connection = connect;
                        command.Parameters.Add("UserId", SqlDbType.Int).Value = userId;

                        connect.Open();

                        int totalCount = (int)command.ExecuteScalar();

                        return totalCount;
                    }
                }
            }

            catch (Exception ex)
            {
                return 0;
            }
        }

        public void UpdateOrder(int userId, int cartId, int destination)
        {
            List<CartObjectDB> carts = new List<CartObjectDB>();

            try
            {
                using (SqlConnection connect = new SqlConnection(ConfigurationManager.ConnectionStrings["CnnStr1"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand())
                    {
                        command.CommandText = @"declare @UserCarts TABLE
(
	RowNumber INT,
	CartId INT,
	CartIndex FLOAT,
	UserId INT
)
declare @TempCarts TABLE 
(
	CartIndex FLOAT
)
declare @CurrentIndex FLOAT = 0;
declare @NewIndex FLOAT = 0;

INSERT INTO @UserCarts
	SELECT ROW_NUMBER() OVER (ORDER BY co.CartIndex DESC) AS RowNumber, cc.CartId, co.CartIndex, co.UserId FROM Carts AS cc
	INNER JOIN CartOwners AS co ON cc.CartId = co.CartId
	WHERE co.UserId = @UserId

SELECT @CurrentIndex = uc.RowNumber FROM @UserCarts as uc WHERE uc.CartId = @CartId

IF @CurrentIndex <> @Destination
BEGIN

	IF @Destination > @CurrentIndex
		INSERT INTO @TempCarts
			SELECT x.CartIndex FROM @UserCarts AS x 
			WHERE x.RowNumber = @Destination OR x.RowNumber = (@Destination + 1)
	ELSE
		INSERT INTO @TempCarts
			SELECT x.CartIndex FROM @UserCarts AS x 
			WHERE x.RowNumber = @Destination OR x.RowNumber = (@Destination - 1)

	IF (SELECT COUNT(*) FROM @TempCarts) = 2
		SELECT @NewIndex = AVG(tr.CartIndex) FROM @TempCarts as tr
	ELSE IF @Destination = 1
		SELECT @NewIndex = (tr.CartIndex + 1) FROM @TempCarts as tr
	ELSE
		SELECT @NewIndex = (tr.CartIndex - 1) FROM @TempCarts as tr

	UPDATE CartOwners 
		SET CartIndex = @NewIndex
	WHERE CartId = @CartId AND UserId = @UserId 
END";

                        command.Connection = connect;
                        command.Parameters.Add("UserId", SqlDbType.Int).Value = userId;
                        command.Parameters.Add("CartId", SqlDbType.Int).Value = cartId;
                        command.Parameters.Add("Destination", SqlDbType.Int).Value = destination + 1;

                        connect.Open();

                        int result = command.ExecuteNonQuery();
                    }
                }
            }
            catch (Exception ex)
            {

            }
        }
    }
}
