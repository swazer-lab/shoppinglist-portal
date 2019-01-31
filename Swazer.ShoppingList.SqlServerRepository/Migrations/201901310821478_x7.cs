namespace Swazer.ShoppingList.SqlServerRepository.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class x7 : DbMigration
    {
        public override void Up()
        {
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
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Images", "UserId", "dbo.Users");
            DropIndex("dbo.Images", new[] { "UserId" });
            DropTable("dbo.Images");
        }
    }
}
