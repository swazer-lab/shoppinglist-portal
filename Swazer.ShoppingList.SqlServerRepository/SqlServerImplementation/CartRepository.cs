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
        public List<CartObject> FetchCards(CartMobileSearchCriteria criteria)
        {
            List<CartObjectDB> carts = new List<CartObjectDB>();

            try
            {
                using (SqlConnection connect = new SqlConnection(ConfigurationManager.ConnectionStrings["CnnStr1"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand())
                    {
                        command.CommandText = @"SELECT c.CartId, c.Title, c.Notes, c.Date, co.CartIndex, i.ItemId, i.Title as itemTitle, ci.Status as itemStatus FROM Carts as c
LEFT JOIN CartItems AS ci ON ci.CartId = c.CartId
LEFT JOIN Items AS i ON i.ItemId = ci.ItemId
INNER JOIN CartOwners AS co ON c.CartId = co.CartId AND co.UserId = @UserId
Where c.CartId IN (
	SELECT cc.CartId FROM Carts AS cc
	INNER JOIN CartOwners AS co ON cc.CartId = co.CartId
	WHERE co.UserId = @UserId AND (@Title is null or cc.Title LIKE '%'+@Title+'%')
	ORDER BY co.CartIndex
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
                                cart.Date = dr["Date"] == DBNull.Value ? null : (DateTime?)dr["Date"];

                                cart.CartIndex = (double)dr["CartIndex"];
                                cart.ItemId = dr["ItemId"] == DBNull.Value ? null : (int?)dr["ItemId"];
                                cart.ItemTitle = dr["itemTitle"] == DBNull.Value ? null : dr["itemTitle"].ToString();
                                cart.ItemStatus = dr["itemStatus"] == DBNull.Value ? null : (int?)dr["itemStatus"];

                                carts.Add(cart);
                            }
                        }
                    }
                }

                var groupingCart = carts.GroupBy(x => x.CartId);
                List<CartObject> returnedCarts = groupingCart.Select(cart => new CartObject
                {
                    CartId = cart.Key,
                    Title = cart.FirstOrDefault().Title,
                    Notes = cart.FirstOrDefault()?.Notes,
                    CartIndex = cart.FirstOrDefault().CartIndex,
                    Date = cart.FirstOrDefault()?.Date,

                    Items = (cart.Count() == 1 && cart.First().ItemId == null)
                    ? new List<CartItemObject>()
                    : cart.Select(item => new CartItemObject()
                    {
                        ItemId = item.ItemId ?? 0,
                        Status = (ItemStatus?)item.ItemStatus ?? ItemStatus.Active,
                        Title = item.Title
                    }).ToList()
                }).ToList();

                return returnedCarts;
            }
            catch (Exception ex)
            {
                return null;
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
