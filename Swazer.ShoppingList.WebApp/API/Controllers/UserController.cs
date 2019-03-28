using Swazer.ShoppingList.WebApp.Infrastructure;
using Swazer.ShoppingList.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Swazer.ShoppingList.Domain;
using System.IO;
using Swazer.ShoppingList.WebApp.API.Models;
using Swazer.ShoppingList.WebApp.API.Infrastructure;

namespace Swazer.ShoppingList.WebApp.API.Controllers
{
    [RoutePrefix("api/user")]
    [AllowApiUser]
    public class UserController : BaseApiController
    {
        [Route("fetch")]
        [HttpGet]
        public IHttpActionResult FetchUsers(string name = "")
        {
            User user = GetCurrentUser();
            
            List<User> carts = UserService.Obj.Find(name).Take(5).ToList();

            var result = new PagingBindingModel<UserProfileBindingModel>()
            {
                Items = carts.Select(x => x.ToUserProfileBindingModel()).ToList()
            };

            foreach (var userBindingModel in result.Items.ToList())
            {
                userBindingModel.PhotoId = ImageService.Obj.FindByUserId(userBindingModel.UserId)?.ImageId;
            }

            return Ok(result);
        }

        [Route("updatePhoto")]
        [HttpPost]
        public IHttpActionResult UpdateUserPhoto([FromBody]PhotoBindingModel model)
        {
            User user = GetCurrentUser();

            int imageId = UserService.Obj.UpdateOrCreatePhoto(user, model.Photo);

            return Ok(imageId);
        }

        [Route("update")]
        [HttpPost]
        public IHttpActionResult UpdateUser(UpdateUserBindingModel model)
        {
            User user = GetCurrentUser();

            user.Update(model.Name, model.Mobile);

            UserService.Obj.Update(user);

            return Ok();
        }

        [HttpGet]
        [Route("getPhoto")]
        [AllowAnonymous]
        public HttpResponseMessage GetPhoto([FromUri]int photoId)
        {
            Image image = ImageService.Obj.FindById(photoId);

            if (image == null)
                return new HttpResponseMessage(HttpStatusCode.NotFound);

            MemoryStream ms = new MemoryStream(image.BlobContent);

            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new StreamContent(ms);
            response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");

            return response;
        }

        [HttpPost]
        [Route("deletePhoto")]
        public IHttpActionResult DeletePhoto()
        {
            User currentUser = GetCurrentUser();

            Image image = ImageService.Obj.FindByUserId(currentUser.Id);

            ImageService.Obj.Delete(image);

            return Ok();
        }
    }
}
