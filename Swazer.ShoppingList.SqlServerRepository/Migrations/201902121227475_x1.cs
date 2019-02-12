namespace Swazer.ShoppingList.SqlServerRepository.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class x1 : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.CartItems",
                c => new
                    {
                        CartItemId = c.Int(nullable: false, identity: true),
                        CartId = c.Int(nullable: false),
                        ItemId = c.Int(nullable: false),
                        Status = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.CartItemId)
                .ForeignKey("dbo.Carts", t => t.CartId, cascadeDelete: true)
                .ForeignKey("dbo.Items", t => t.ItemId, cascadeDelete: true)
                .Index(t => t.CartId)
                .Index(t => t.ItemId);
            
            CreateTable(
                "dbo.Carts",
                c => new
                    {
                        CartId = c.Int(nullable: false, identity: true),
                        Title = c.String(),
                        Notes = c.String(),
                        Date = c.DateTime(),
                        IsActive = c.Boolean(nullable: false),
                        CreatedAt = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.CartId);
            
            CreateTable(
                "dbo.CartOwners",
                c => new
                    {
                        CartOwnerId = c.Int(nullable: false, identity: true),
                        UserId = c.Int(nullable: false),
                        CartId = c.Int(nullable: false),
                        AccessLevel = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.CartOwnerId)
                .ForeignKey("dbo.Carts", t => t.CartId, cascadeDelete: true)
                .ForeignKey("dbo.Users", t => t.UserId, cascadeDelete: true)
                .Index(t => t.UserId)
                .Index(t => t.CartId);
            
            CreateTable(
                "dbo.Users",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        UserName = c.String(maxLength: 256),
                        Email = c.String(maxLength: 256),
                        EmailConfirmed = c.Boolean(nullable: false),
                        PasswordHash = c.String(),
                        SecurityStamp = c.String(),
                        ConcurrencyStamp = c.Binary(nullable: false, fixedLength: true, timestamp: true, storeType: "rowversion"),
                        PhoneNumber = c.String(maxLength: 15),
                        PhoneNumberConfirmed = c.Boolean(nullable: false),
                        TwoFactorEnabled = c.Boolean(nullable: false),
                        LockoutEnd = c.DateTimeOffset(precision: 7),
                        LockoutEnabled = c.Boolean(nullable: false),
                        AccessFailedCount = c.Int(nullable: false),
                        IsActive = c.Boolean(),
                        Name = c.String(maxLength: 250),
                        Mobile = c.String(maxLength: 15),
                        LastLoginTime = c.DateTime(),
                        CreatedByID = c.Int(),
                        UpdatedByID = c.Int(),
                        CreatedAt = c.DateTime(),
                        UpdatedAt = c.DateTime(),
                        Discriminator = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Users", t => t.CreatedByID)
                .ForeignKey("dbo.Users", t => t.UpdatedByID)
                .Index(t => t.CreatedByID)
                .Index(t => t.UpdatedByID);
            
            CreateTable(
                "dbo.UserClaims",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        UserId = c.Int(nullable: false),
                        ClaimType = c.String(),
                        ClaimValue = c.String(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Users", t => t.UserId, cascadeDelete: true)
                .Index(t => t.UserId);
            
            CreateTable(
                "dbo.UserLogins",
                c => new
                    {
                        LoginProvider = c.String(nullable: false, maxLength: 128),
                        ProviderKey = c.String(nullable: false, maxLength: 128),
                        ProviderDisplayName = c.String(),
                        UserId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => new { t.LoginProvider, t.ProviderKey })
                .ForeignKey("dbo.Users", t => t.UserId, cascadeDelete: true)
                .Index(t => t.UserId);
            
            CreateTable(
                "dbo.Roles",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(maxLength: 256),
                        ArabicName = c.String(),
                        EnglishName = c.String(),
                        ConcurrencyStamp = c.Binary(nullable: false, fixedLength: true, timestamp: true, storeType: "rowversion"),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.RoleClaims",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        RoleId = c.Int(nullable: false),
                        ClaimType = c.String(),
                        ClaimValue = c.String(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Roles", t => t.RoleId, cascadeDelete: true)
                .Index(t => t.RoleId);
            
            CreateTable(
                "dbo.Items",
                c => new
                    {
                        ItemId = c.Int(nullable: false, identity: true),
                        Title = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.ItemId);
            
            CreateTable(
                "dbo.Friends",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        RequestedById = c.Int(nullable: false),
                        RequestedToId = c.Int(nullable: false),
                        RequestTime = c.DateTime(nullable: false),
                        FriendRequestFlag = c.Int(nullable: false),
                        CreatedAt = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Users", t => t.RequestedById)
                .ForeignKey("dbo.Users", t => t.RequestedToId)
                .Index(t => t.RequestedById)
                .Index(t => t.RequestedToId);
            
            CreateTable(
                "dbo.Images",
                c => new
                    {
                        ImageId = c.Int(nullable: false, identity: true),
                        UserId = c.Int(nullable: false),
                        BlobContent = c.Binary(nullable: false),
                    })
                .PrimaryKey(t => t.ImageId)
                .ForeignKey("dbo.Users", t => t.UserId, cascadeDelete: true)
                .Index(t => t.UserId);
            
            CreateTable(
                "dbo.UserSmsVerifications",
                c => new
                    {
                        UserSmsVerificationId = c.Int(nullable: false, identity: true),
                        SMSRefId = c.Guid(nullable: false),
                        ResendCounter = c.Int(nullable: false),
                        Code = c.String(maxLength: 10, unicode: false),
                        ExpiredAt = c.DateTime(nullable: false),
                        UpdatedTime = c.DateTime(nullable: false),
                        UserVerificationStatusId = c.Int(nullable: false),
                        UserVerificationReasonId = c.Int(nullable: false),
                        UserId = c.Int(),
                        CreatedAt = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.UserSmsVerificationId)
                .ForeignKey("dbo.Users", t => t.UserId)
                .ForeignKey("dbo.UserVerificationReasons", t => t.UserVerificationReasonId, cascadeDelete: true)
                .ForeignKey("dbo.UserVerificationStatus", t => t.UserVerificationStatusId, cascadeDelete: true)
                .Index(t => t.UserVerificationStatusId)
                .Index(t => t.UserVerificationReasonId)
                .Index(t => t.UserId);
            
            CreateTable(
                "dbo.UserVerificationReasons",
                c => new
                    {
                        UserVerificationReasonId = c.Int(nullable: false, identity: true),
                        Description = c.String(maxLength: 50),
                    })
                .PrimaryKey(t => t.UserVerificationReasonId);
            
            CreateTable(
                "dbo.UserVerificationStatus",
                c => new
                    {
                        UserVerificationStatusId = c.Int(nullable: false, identity: true),
                        Description = c.String(maxLength: 50),
                    })
                .PrimaryKey(t => t.UserVerificationStatusId);
            
            CreateTable(
                "dbo.UsersRoles",
                c => new
                    {
                        UserID = c.Int(nullable: false),
                        RoleID = c.Int(nullable: false),
                    })
                .PrimaryKey(t => new { t.UserID, t.RoleID })
                .ForeignKey("dbo.Users", t => t.UserID, cascadeDelete: true)
                .ForeignKey("dbo.Roles", t => t.RoleID, cascadeDelete: true)
                .Index(t => t.UserID)
                .Index(t => t.RoleID);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.UserSmsVerifications", "UserVerificationStatusId", "dbo.UserVerificationStatus");
            DropForeignKey("dbo.UserSmsVerifications", "UserVerificationReasonId", "dbo.UserVerificationReasons");
            DropForeignKey("dbo.UserSmsVerifications", "UserId", "dbo.Users");
            DropForeignKey("dbo.Images", "UserId", "dbo.Users");
            DropForeignKey("dbo.Friends", "RequestedToId", "dbo.Users");
            DropForeignKey("dbo.Friends", "RequestedById", "dbo.Users");
            DropForeignKey("dbo.CartItems", "ItemId", "dbo.Items");
            DropForeignKey("dbo.CartItems", "CartId", "dbo.Carts");
            DropForeignKey("dbo.CartOwners", "UserId", "dbo.Users");
            DropForeignKey("dbo.Users", "UpdatedByID", "dbo.Users");
            DropForeignKey("dbo.UsersRoles", "RoleID", "dbo.Roles");
            DropForeignKey("dbo.UsersRoles", "UserID", "dbo.Users");
            DropForeignKey("dbo.UserLogins", "UserId", "dbo.Users");
            DropForeignKey("dbo.UserClaims", "UserId", "dbo.Users");
            DropForeignKey("dbo.RoleClaims", "RoleId", "dbo.Roles");
            DropForeignKey("dbo.Users", "CreatedByID", "dbo.Users");
            DropForeignKey("dbo.CartOwners", "CartId", "dbo.Carts");
            DropIndex("dbo.UsersRoles", new[] { "RoleID" });
            DropIndex("dbo.UsersRoles", new[] { "UserID" });
            DropIndex("dbo.UserSmsVerifications", new[] { "UserId" });
            DropIndex("dbo.UserSmsVerifications", new[] { "UserVerificationReasonId" });
            DropIndex("dbo.UserSmsVerifications", new[] { "UserVerificationStatusId" });
            DropIndex("dbo.Images", new[] { "UserId" });
            DropIndex("dbo.Friends", new[] { "RequestedToId" });
            DropIndex("dbo.Friends", new[] { "RequestedById" });
            DropIndex("dbo.RoleClaims", new[] { "RoleId" });
            DropIndex("dbo.UserLogins", new[] { "UserId" });
            DropIndex("dbo.UserClaims", new[] { "UserId" });
            DropIndex("dbo.Users", new[] { "UpdatedByID" });
            DropIndex("dbo.Users", new[] { "CreatedByID" });
            DropIndex("dbo.CartOwners", new[] { "CartId" });
            DropIndex("dbo.CartOwners", new[] { "UserId" });
            DropIndex("dbo.CartItems", new[] { "ItemId" });
            DropIndex("dbo.CartItems", new[] { "CartId" });
            DropTable("dbo.UsersRoles");
            DropTable("dbo.UserVerificationStatus");
            DropTable("dbo.UserVerificationReasons");
            DropTable("dbo.UserSmsVerifications");
            DropTable("dbo.Images");
            DropTable("dbo.Friends");
            DropTable("dbo.Items");
            DropTable("dbo.RoleClaims");
            DropTable("dbo.Roles");
            DropTable("dbo.UserLogins");
            DropTable("dbo.UserClaims");
            DropTable("dbo.Users");
            DropTable("dbo.CartOwners");
            DropTable("dbo.Carts");
            DropTable("dbo.CartItems");
        }
    }
}
