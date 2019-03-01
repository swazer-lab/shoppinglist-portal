using Swazer.ShoppingList.Core;
using System.Data.Entity;
using System.Data.Entity.SqlServer;

namespace Swazer.ShoppingList.SqlServerRepository
{
    public class ShoppingListContext : DbContext
    {
        #region Identity
        public DbSet<IdentityUserClaim> UserClaims { get; set; }
        public DbSet<IdentityUserLogin> UserLogins { get; set; }
        public DbSet<IdentityRole> Roles { get; set; }
        public DbSet<IdentityRoleClaim> RoleClaims { get; set; }
        public DbSet<IdentityUser> Users { get; set; }
        #endregion

        #region Verfication
        public DbSet<UserSmsVerification> UserSmsVerifications { get; set; }
        public DbSet<UserVerificationReason> UserVerificationReasons { get; set; }
        public DbSet<UserVerificationStatus> UserVerificationStatuses { get; set; }
        #endregion

        #region Tables
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<CartOwner> CartOwners { get; set; }
        public DbSet<Friend> Friends { get; set; }
        public DbSet<Image> Images { get; set; }
        public DbSet<Item> Items { get; set; }
        public DbSet<ResetPasswordConfirmationInfo> ResetConfigInfo { get; set; }
        #endregion

        public ShoppingListContext() : base("CnnStr1")
        {
            base.Configuration.ProxyCreationEnabled = false;

            SqlProviderServices ensureDLLIsCopied = SqlProviderServices.Instance;
#if DEBUG
            Database.Log = s => System.Diagnostics.Debug.WriteLine(s);
#endif
            Database.SetInitializer<ShoppingListContext>(new CreateDatabaseIfNotExists<ShoppingListContext>());
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            Database.SetInitializer<ShoppingListContext>(null);

            base.OnModelCreating(modelBuilder);

            ConfigureBaseEntity<BaseEntity>(modelBuilder);

            ConfigureIdentity(modelBuilder);
        }

        private void ConfigureIdentity(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<IdentityUserClaim>()
                .HasKey(uc => uc.Id)
                .ToTable("UserClaims");

            modelBuilder.Entity<IdentityRoleClaim>()
                .HasKey(rc => rc.Id)
                .ToTable("RoleClaims");

            modelBuilder.Entity<IdentityUserLogin>()
                .HasKey(l => new { l.LoginProvider, l.ProviderKey })
                .ToTable("UserLogins");

            modelBuilder.Entity<IdentityRole>()
                .ToTable("Roles")
                .Property(r => r.ConcurrencyStamp)
                .IsRowVersion();

            modelBuilder.Entity<Friend>()
                 .HasRequired(c => c.RequestedBy)
                 .WithMany()
                 .WillCascadeOnDelete(false);

            modelBuilder.Entity<Friend>()
                .HasRequired(c => c.RequestedTo)
                .WithMany()
                .WillCascadeOnDelete(false);

            modelBuilder.Entity<IdentityRole>().Property(u => u.Name).HasMaxLength(256);
            modelBuilder.Entity<IdentityRole>().HasMany(r => r.Claims).WithRequired().HasForeignKey(r => r.RoleId);

            modelBuilder.Entity<IdentityUser>()
                .ToTable("Users")
                .HasMany(u => u.Roles)
                .WithMany(r => r.Users)
                .Map(x =>
                {
                    x.MapLeftKey("UserID");
                    x.MapRightKey("RoleID");
                    x.ToTable("UsersRoles");
                });

            modelBuilder.Entity<IdentityUser>().Property(u => u.ConcurrencyStamp).IsRowVersion();
            modelBuilder.Entity<IdentityUser>().Property(u => u.UserName).HasMaxLength(256);
            modelBuilder.Entity<IdentityUser>().Property(u => u.Email).HasMaxLength(256);
            modelBuilder.Entity<IdentityUser>().HasMany(u => u.Claims).WithRequired().HasForeignKey(uc => uc.UserId);
            modelBuilder.Entity<IdentityUser>().HasMany(u => u.Logins).WithRequired().HasForeignKey(ul => ul.UserId);
        }

        private void ConfigureBaseEntity<TEntity>(DbModelBuilder modelBuilder) where TEntity : BaseEntity
        {
            modelBuilder.Entity<UserSmsVerification>().Ignore(x => x.CreatedBy).Ignore(x => x.CreatedByID);
            modelBuilder.Entity<UserSmsVerification>().Ignore(x => x.UpdatedBy).Ignore(x => x.UpdatedByID).Ignore(x => x.UpdatedAt);

            modelBuilder.Entity<UserVerificationReason>().Ignore(x => x.CreatedAt).Ignore(x => x.CreatedBy).Ignore(x => x.CreatedByID);
            modelBuilder.Entity<UserVerificationReason>().Ignore(x => x.UpdatedAt).Ignore(x => x.UpdatedBy).Ignore(x => x.UpdatedByID);

            modelBuilder.Entity<ResetPasswordConfirmationInfo>().Ignore(x => x.CreatedBy).Ignore(x => x.CreatedByID);
            modelBuilder.Entity<ResetPasswordConfirmationInfo>().Ignore(x => x.UpdatedAt).Ignore(x => x.UpdatedBy).Ignore(x => x.UpdatedByID);

            modelBuilder.Entity<UserVerificationStatus>().Ignore(x => x.CreatedAt).Ignore(x => x.CreatedBy).Ignore(x => x.CreatedByID);
            modelBuilder.Entity<UserVerificationStatus>().Ignore(x => x.UpdatedAt).Ignore(x => x.UpdatedBy).Ignore(x => x.UpdatedByID);

            modelBuilder.Entity<CartOwner>().Ignore(x => x.CreatedAt).Ignore(x => x.CreatedBy).Ignore(x => x.CreatedByID);
            modelBuilder.Entity<CartOwner>().Ignore(x => x.UpdatedAt).Ignore(x => x.UpdatedBy).Ignore(x => x.UpdatedByID);

            modelBuilder.Entity<Cart>().Ignore(x => x.CreatedBy).Ignore(x => x.CreatedByID);
            modelBuilder.Entity<Cart>().Ignore(x => x.UpdatedAt).Ignore(x => x.UpdatedBy).Ignore(x => x.UpdatedByID);

            modelBuilder.Entity<Friend>().Ignore(x => x.CreatedBy).Ignore(x => x.CreatedByID);
            modelBuilder.Entity<Friend>().Ignore(x => x.UpdatedAt).Ignore(x => x.UpdatedBy).Ignore(x => x.UpdatedByID);

            modelBuilder.Entity<CartItem>().Ignore(x => x.CreatedAt).Ignore(x => x.CreatedBy).Ignore(x => x.CreatedByID);
            modelBuilder.Entity<CartItem>().Ignore(x => x.UpdatedAt).Ignore(x => x.UpdatedBy).Ignore(x => x.UpdatedByID);

            modelBuilder.Entity<Image>().Ignore(x => x.CreatedAt).Ignore(x => x.CreatedBy).Ignore(x => x.CreatedByID);
            modelBuilder.Entity<Image>().Ignore(x => x.UpdatedAt).Ignore(x => x.UpdatedBy).Ignore(x => x.UpdatedByID);

            modelBuilder.Entity<Item>().Ignore(x => x.CreatedAt).Ignore(x => x.CreatedBy).Ignore(x => x.CreatedByID);
            modelBuilder.Entity<Item>().Ignore(x => x.UpdatedAt).Ignore(x => x.UpdatedBy).Ignore(x => x.UpdatedByID);

            modelBuilder.Entity<User>().HasOptional(x => x.CreatedBy).WithMany().HasForeignKey(x => x.CreatedByID).WillCascadeOnDelete(false);
            modelBuilder.Entity<User>().HasOptional(x => x.UpdatedBy).WithMany().HasForeignKey(x => x.UpdatedByID).WillCascadeOnDelete(false);
        }
    }
}