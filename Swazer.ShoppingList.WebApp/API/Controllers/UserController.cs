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

namespace Swazer.ShoppingList.WebApp.API.Controllers
{
    [RoutePrefix("api/user")]
    [AllowApiUser]
    public class UserController : BaseApiController
    {
        [Route("updatePhoto")]
        [HttpPost]
        public IHttpActionResult UpdateUserPhoto([FromBody]PhotoBindingModel model)
        {
            User user = GetCurrentUser();

            int imageId = UserService.Obj.UpdateOrCreatePhoto(user, model.Photo);

            return Ok(imageId);
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
    }
}
