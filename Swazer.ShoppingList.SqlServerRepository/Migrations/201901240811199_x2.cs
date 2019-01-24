namespace Swazer.ShoppingList.SqlServerRepository.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class x2 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Users", "Name", c => c.String(maxLength: 250));
            DropColumn("dbo.Users", "ArabicName");
            DropColumn("dbo.Users", "EnglishName");
            DropColumn("dbo.Users", "Address");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Users", "Address", c => c.String(maxLength: 500));
            AddColumn("dbo.Users", "EnglishName", c => c.String(maxLength: 250));
            AddColumn("dbo.Users", "ArabicName", c => c.String(maxLength: 250));
            DropColumn("dbo.Users", "Name");
        }
    }
}
