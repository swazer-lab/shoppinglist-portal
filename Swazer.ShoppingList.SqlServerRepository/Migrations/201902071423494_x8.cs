namespace Swazer.ShoppingList.SqlServerRepository.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class x8 : DbMigration
    {
        public override void Up()
        {
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
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Friends", "RequestedToId", "dbo.Users");
            DropForeignKey("dbo.Friends", "RequestedById", "dbo.Users");
            DropIndex("dbo.Friends", new[] { "RequestedToId" });
            DropIndex("dbo.Friends", new[] { "RequestedById" });
            DropTable("dbo.Friends");
        }
    }
}
