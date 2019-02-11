using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.WebApp.API.Models;
using Swazer.ShoppingList.WebApp.Infrastructure;
using Swazer.ShoppingList.WebApp.API.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Swazer.ShoppingList.Domain;

namespace Swazer.ShoppingList.WebApp.API.Controllers
{
    [RoutePrefix("api/friend")]
    [AllowApiUser]
    public class FriendController : BaseApiController
    {
        [Route("fetch")]
        [HttpGet]
        public IHttpActionResult FetchFriends([FromUri]FriendSearchCriteriaBindingModel model)
        {
            User user = GetCurrentUser();

            FriendMobileSearchCriteria friendMobileSearchCriteria = model.ToSearchCriteria(user.Id);

            IQueryResult<User> carts = FriendService.Obj.Find(friendMobileSearchCriteria);

            var result = new PagingBindingModel<UserProfileBindingModel>()
            {
                Items = carts.Items.Select(x => x.ToUserProfileBindingModel()).ToList(),
                TotalCount = carts.TotalCount
            };

            foreach (var userBindingModel in result.Items.ToList())
            {
                userBindingModel.PhotoId = ImageService.Obj.FindByUserId(userBindingModel.UserId)?.ImageId;
            }

            return Ok(result);
        }

        [Route("add")]
        [HttpPost]
        public IHttpActionResult AddFriend([FromBody]CreateFriendBindingModel model)
        {
            User userFrom = GetCurrentUser();
            User userTo = UserService.Obj.FindById(model.FriendId);

            FriendService.Obj.Create(userFrom.Id, userTo.Id);

            return Ok();
        }
    }
}
