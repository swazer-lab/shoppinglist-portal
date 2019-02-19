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

            if (savedUserId == userToSaveId)
                return null;

            Friend createdEntity = repository.Create(newFriend);
            if (createdEntity == null)
                throw new RepositoryException("Entity not created");

            Tracer.Log.EntityCreated(nameof(Friend), createdEntity.Id);

            return createdEntity;
        }

        public Friend Update(Friend friend)
        {
            if (friend == null)
                throw new BusinessRuleException(BusinessRuleExceptionType.NotFound);

            repository.Update(friend);

            return friend;
        }

        public void CreateFriends(int userId, int cartId)
        {
            List<Friend> friends = GetAllFriends();

            List<CartOwner> cartOwners = CartOwnerService.Obj.GetUsersByCart(cartId, userId);

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

        public Friend GetFriendsByUserIds(int byId, int toId)
        {
            if (byId == 0 || toId == 0)
                throw new ArgumentNullException(nameof(byId));

            IQueryConstraints<Friend> constraints = new QueryConstraints<Friend>()
                .AndAlso(x => x.RequestedById == byId || x.RequestedById == toId)
                .AndAlso(x => x.RequestedToId == byId || x.RequestedToId == toId);

            return queryRepository.Find(constraints).Items.FirstOrDefault();
        }

        public IQueryResult<User> Find(FriendMobileSearchCriteria criterias)
        {
            if (criterias == null)
                throw new ArgumentNullException(nameof(criterias));

            IQueryConstraints<Friend> constraints = new QueryConstraints<Friend>()
                .Where(x => x.RequestedById == criterias.UserId || x.RequestedToId == criterias.UserId)
                .AndAlso(x => x.FriendRequestFlag == FriendRequestFlag.Approved);

            List<Friend> result = queryRepository.Find(constraints).Items.ToList();

            List<int> requestedByIds = result.Select(x => x.RequestedById).ToList();
            List<int> requestedToIds = result.Select(x => x.RequestedToId).ToList();

            requestedByIds.AddRange(requestedToIds);

            IQueryConstraints<User> constraintsUser = new QueryConstraints<User>()
                .PageAndSort(criterias, x => x.Id)
                .Where(x => requestedByIds.Contains(x.Id))
                .AndAlso(x => x.Id != criterias.UserId);

            return queryRepository.Find(constraintsUser);
        }
    }
}
