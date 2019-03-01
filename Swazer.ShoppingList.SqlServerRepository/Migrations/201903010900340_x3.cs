namespace Swazer.ShoppingList.SqlServerRepository.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class x3 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Items", "CreatedByID", c => c.Int(nullable: false, defaultValue: 1));
            CreateIndex("dbo.Items", "CreatedByID");
            AddForeignKey("dbo.Items", "CreatedByID", "dbo.Users", "Id", cascadeDelete: true);
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Items", "CreatedByID", "dbo.Users");
            DropIndex("dbo.Items", new[] { "CreatedByID" });
            DropColumn("dbo.Items", "CreatedByID");
        }
    }
}
