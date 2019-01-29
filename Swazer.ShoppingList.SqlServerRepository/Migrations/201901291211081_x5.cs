namespace Swazer.ShoppingList.SqlServerRepository.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class x5 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Carts", "IsActive", c => c.Boolean(nullable: false));
            AddColumn("dbo.CartItems", "Status", c => c.Int(nullable: false));
            AddColumn("dbo.Items", "IsActive", c => c.Boolean(nullable: false));
            DropColumn("dbo.Items", "Status");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Items", "Status", c => c.Int(nullable: false));
            DropColumn("dbo.Items", "IsActive");
            DropColumn("dbo.CartItems", "Status");
            DropColumn("dbo.Carts", "IsActive");
        }
    }
}
