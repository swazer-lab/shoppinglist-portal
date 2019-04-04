namespace Swazer.ShoppingList.SqlServerRepository.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class x4 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.CartOwners", "CartIndex", c => c.Double(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.CartOwners", "CartIndex");
        }
    }
}
