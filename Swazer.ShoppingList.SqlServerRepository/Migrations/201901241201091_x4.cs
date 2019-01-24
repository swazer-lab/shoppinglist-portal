namespace Swazer.ShoppingList.SqlServerRepository.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class x4 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Carts", "Date", c => c.DateTime(nullable: false));
            AddColumn("dbo.Carts", "CreatedAt", c => c.DateTime(nullable: false));
            AddColumn("dbo.Items", "Title", c => c.String());
            AddColumn("dbo.Items", "Status", c => c.Int(nullable: false));
            DropColumn("dbo.Items", "Name");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Items", "Name", c => c.String());
            DropColumn("dbo.Items", "Status");
            DropColumn("dbo.Items", "Title");
            DropColumn("dbo.Carts", "CreatedAt");
            DropColumn("dbo.Carts", "Date");
        }
    }
}
