using System;
using System.Web;
using System.Web.Optimization;

namespace Swazer.ShoppingList.WebApp
{
    public class BundleConfig
    {
        // For more information on bundling, visit https://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            BundleTable.EnableOptimizations = false;

            bundles.Add(new StyleBundle("~/Content/flags").Include(
                "~/Content/flags/docs.css",
                "~/Content/flags/flag-icon.min.css"));

            bundles.Add(new StyleBundle("~/Content/ShoppingStyle").Include(
                "~/Content/ShoppingStyle/bootstrap.min.css",
                "~/Content/ShoppingStyle/font-awesome.min.css",
                "~/Content/ShoppingStyle/magnific-popup.css",
                "~/Content/POS/css/owl.carousel.min.css",
                "~/Content/Admin/animate.min.css",  // this will use the updated version of the animation
                "~/Content/ShoppingStyle/main.css",
                "~/Content/ShoppingStyle/blue.css",
                "~/Content/ShoppingStyle/login.css",
                "~/Content/ShoppingStyle/survey.css",
                "~/Content/ShoppingStyle/register.css",
                "~/Content/ShoppingStyle/responsive.css"));

            bundles.Add(new StyleBundle("~/Content/ShoppingStyle-rtl").Include(
                 "~/Content/Admin/plugins/bootstrap-rtl/bootstrap-rtl.css",
                 "~/Content/ShoppingStyle/main-rtl.css"));

            bundles.Add(new StyleBundle("~/plugins/toastrStyles").Include(
                "~/Content/Admin/plugins/toastr/toastr.min.css"));

            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                 "~/Scripts/jquery-{version}.js"));

            // toastr notification 
            bundles.Add(new ScriptBundle("~/plugins/toastr").Include(
                      "~/Scripts/plugins/toastr/toastr.min.js"));

            // toastr notification styles
            bundles.Add(new StyleBundle("~/plugins/toastrStyles").Include(
                      "~/Content/Admin/plugins/toastr/toastr.min.css"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                 "~/Scripts/bootstrap.js",
                 "~/Scripts/respond.js",
                 "~/Scripts/app.js"));

            bundles.Add(new ScriptBundle("~/bundles/ShoppingStyle").Include(
    "~/Scripts/canvas.js",
    "~/Scripts/html5shiv.js",
    "~/Scripts/jquery.magnific-popup.min.js",
    "~/Scripts/jquery.nav.js",
    "~/Scripts/ShoppingStyle.main.js",
    "~/Scripts/POS/owl.carousel.min.js",
    "~/Scripts/preloader.js",
    "~/Scripts/wow.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
    "~/Scripts/jquery.unobtrusive*",
    "~/Scripts/jquery.validate*"));

        }

    }
}
