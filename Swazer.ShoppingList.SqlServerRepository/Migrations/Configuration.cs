namespace Swazer.ShoppingList.SqlServerRepository.Migrations
{
    using Swazer.ShoppingList.Core;
    using System;
    using System.Collections.Generic;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;

    internal sealed class Configuration : DbMigrationsConfiguration<Swazer.ShoppingList.SqlServerRepository.ShoppingListContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = false;
        }

        protected override void Seed(ShoppingListContext context)
        {
            context.UserVerificationStatuses.AddOrUpdate(
                b => b.UserVerificationStatusId, UserVerificationStatus.GetDefaults().ToArray());

            context.UserVerificationReasons.AddOrUpdate(uv => uv.UserVerificationReasonId, UserVerificationReason.GetDefaults().ToArray());

            context.Roles.AddOrUpdate(r => r.Name, RoleNames.GetRolesWithCaptions().Select(r => new IdentityRole { Name = r.Key, ArabicName = r.Value, EnglishName = r.Value }).ToArray());

            context.SaveChanges();

        }

        private static void SeedWorkPeriodsAndHours(ShoppingListContext context)
        {

        }
    }
}
