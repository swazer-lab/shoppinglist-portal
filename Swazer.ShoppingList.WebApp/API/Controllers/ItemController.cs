using Swazer.ShoppingList.WebApp.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Swazer.ShoppingList.WebApp.API.Controllers
{
    [RoutePrefix("api/cart")]
    public class ItemController : BaseApiController
    {
        [HttpPost]
        [Route("cart")]
        [AllowApiTeacher]
        public IHttpActionResult CreateSubject(SubjectBindingModel model)
        {
            User user = GetCurrentUser();

            Subject subject = Subject.CreateForMobile(model.Name, user);

            Subject createdSubject = SubjectService.Obj.Create(subject);

            UserService.Obj.SendSubjectAddedInfo(createdSubject.Name, user.Email);

            return Ok(createdSubject.SubjectId);
        }
    }
}
