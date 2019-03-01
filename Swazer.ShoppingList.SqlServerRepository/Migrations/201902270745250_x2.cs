namespace Swazer.ShoppingList.SqlServerRepository.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class x2 : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.ResetPasswordConfirmationInfoes",
                c => new
                    {
                        ResetPasswordConfirmationInfoId = c.Int(nullable: false, identity: true),
                        Token = c.String(),
                        Email = c.String(),
                        Code = c.String(),
                        CreatedAt = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.ResetPasswordConfirmationInfoId);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.ResetPasswordConfirmationInfoes");
        }
    }
}
