namespace Swazer.ShoppingList.SqlServerRepository.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class x6 : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.Carts", "Date", c => c.DateTime());
        }
        
        public override void Down()
        {
            AlterColumn("dbo.Carts", "Date", c => c.DateTime(nullable: false));
        }
    }
}
