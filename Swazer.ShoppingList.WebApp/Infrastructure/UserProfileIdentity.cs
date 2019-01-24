using Swazer.ShoppingList.Core;
using System.Linq;
using System.Security.Claims;
using System.Security.Principal;

namespace Swazer.ShoppingList.WebApp.Infrastructure
{
    public class UserProfileIdentity : User, IIdentity
    {
        private ClaimsIdentity originalIdentity;

        public UserProfileIdentity(ClaimsIdentity originalIdentity, User userProfile)
        {
            this.originalIdentity = originalIdentity;
            this.CopyFrom(userProfile);
        }

        public string GetClaimValue(string claimType)
        {
            Claim claim = originalIdentity.FindFirst(claimType);
            return claim == null ? "" : claim.Value;
        }

        public int GetUserId()
        {
            int result = 0;
            if (originalIdentity != null)
            {
                // find the NameIdentifier claim
                Claim userIdClaim = originalIdentity.Claims
                    .FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier);

                if (userIdClaim != null)
                {
                    result = int.Parse(userIdClaim.Value);
                }
            }
            return result;
        }

        #region IIdentity Members

        public string AuthenticationType => originalIdentity.AuthenticationType;
        public bool IsAuthenticated => originalIdentity.IsAuthenticated;
        public string Name => originalIdentity.Name;
        #endregion

        private void CopyFrom(Core.User userProfile)
        {
            this.CreatedAt = userProfile.CreatedAt;
            this.CreatedBy = userProfile.CreatedBy;
            this.CreatedByID = userProfile.CreatedByID;
            this.IsActive = userProfile.IsActive;
            this.UpdatedAt = userProfile.UpdatedAt;
            this.UpdatedBy = userProfile.UpdatedBy;
            this.UpdatedByID = userProfile.UpdatedByID;
            this.UserName = userProfile.UserName;
            this.Id = userProfile.Id;
            this.Email = userProfile.Email;
            this.Mobile = userProfile.Mobile;
            this.PhoneNumber = userProfile.PhoneNumber;
        }
    }
}