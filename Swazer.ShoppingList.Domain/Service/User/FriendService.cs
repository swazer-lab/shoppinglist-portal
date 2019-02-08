using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.RepositoryInterface.Queries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.Domain
{
    public class FriendService : BaseDomainService
    {
        public static FriendService Obj { get; }

        static FriendService()
        {
            Obj = new FriendService();
        }

        private FriendService()
        {
        }

        public Friend Create(int savedUserId, int userToSaveId)
        {
            Friend newFriend = Friend.Create(UserService.Obj.FindById(savedUserId), UserService.Obj.FindById(userToSaveId));

            List<Friend> friends = GetAllFriends();

            if (newFriend.AreTheyAlreadyFriend(friends))
                return null;

            Friend createdEntity = repository.Create(newFriend);
            if (createdEntity == null)
                throw new RepositoryException("Entity not created");

            Tracer.Log.EntityCreated(nameof(Friend), createdEntity.Id);

            return createdEntity;
        }

        public void CreateFriends(int userId, int cartId)
        {
            List<Friend> friends = GetAllFriends();

            List<CartOwner> cartOwners = CartService.Obj.GetUsersByCart(cartId);

            if (cartOwners.Count == 1)
                Create(cartOwners.FirstOrDefault().UserId, userId);

            foreach (var friend in friends)
            {
                Create(friend.RequestedById, userId);
                Create(friend.RequestedToId, userId);
            }
        }

        public List<Friend> GetAllFriends()
        {
            IQueryConstraints<Friend> constraints = new QueryConstraints<Friend>();

            return queryRepository.Find(constraints).Items.ToList();
        }
    }
}
