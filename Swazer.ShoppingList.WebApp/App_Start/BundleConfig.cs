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

            // nprogress script
            bundles.Add(new ScriptBundle("~/plugins/nprogress").Include(
                 "~/Scripts/plugins/nprogress/nprogress.min.js"));

            bundles.Add(new StyleBundle("~/plugins/nprogressStyle").Include(
                "~/Content/Admin/plugins/nprogress/nprogress.min.css"));

            // Inspinia script
            bundles.Add(new ScriptBundle("~/bundles/inspinia").Include(
                "~/Scripts/plugins/metisMenu/jquery.metisMenu.js",
                "~/Scripts/app/inspinia.js",
                "~/Scripts/app/utility.js"));

            bundles.Add(new StyleBundle("~/Content/AdmincssRTL").Include(
                "~/Content/Admin/plugins/bootstrap-rtl/bootstrap-rtl.min.css",
                "~/Content/Admin/style-rtl.css"));

            bundles.Add(new StyleBundle("~/Content/Admincss").Include(
                "~/Content/bootstrap.min.css",
                "~/Content/Admin/animate.min.css",
                "~/Content/Admin/style.css",
                "~/Content/Admin/common.css"));

            bundles.Add(new StyleBundle("~/font-awesome/css").Include(
                "~/Content/font-awesome.min.css"));

            // SlimScroll
            bundles.Add(new ScriptBundle("~/plugins/slimScroll").Include(
                "~/Scripts/plugins/slimscroll/jquery.slimscroll.min.js"));

            // knockout
            bundles.Add(new ScriptBundle("~/bundles/knockout").Include(
                "~/Scripts/knockout-3.4.2.js",
                "~/Scripts/knockout.validation.min.js",
                "~/Scripts/knockout.infrastructure.js",
                "~/Scripts/ajaxredirect.js",
                "~/Scripts/knockout.bindingHandlers.js",
                "~/Scripts/ar-SA.js",
                "~/Scripts/pagingVM.js"));

            // i check
            bundles.Add(new StyleBundle("~/Content/plugins/iCheck/iCheckStyles").Include(
               "~/Content/Admin/plugins/iCheck/custom.css"));

            bundles.Add(new ScriptBundle("~/plugins/iCheck").Include(
              "~/Scripts/plugins/iCheck/icheck.min.js"));

            // Touchspin
            bundles.Add(new StyleBundle("~/plugins/touchSpinStyles").Include(
              "~/Content/Admin/plugins/touchspin/jquery.bootstrap-touchspin.min.css"));

            bundles.Add(new ScriptBundle("~/plugins/touchSpin").Include(
              "~/Scripts/plugins/touchspin/jquery.bootstrap-touchspin.min.js"));

            // Moment
            bundles.Add(new ScriptBundle("~/bundles/moment").Include(
                "~/Scripts/plugins/moment/moment.js",
                "~/Scripts/plugins/moment/moment-with-locales.min.js",
                "~/Scripts/plugins/moment/moment-timezone-with-data.min.js"));

            //date picker

            bundles.Add(new ScriptBundle("~/bundles/datetimepicker").Include(
               "~/Scripts/plugins/datetime/bootstrap-datetimepicker.min.js"));

            bundles.Add(new StyleBundle("~/Content/datetimepicker").Include(
               "~/Content/Admin/plugins/datetime/bootstrap-datetimepicker.css"));

            // jQueryUI 
            bundles.Add(new StyleBundle("~/bundles/jqueryui").Include(
                        "~/Scripts/plugins/jquery-ui/jquery-ui.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/colors").Include(
                     "~/Scripts/colors.js"));

            bundles.Add(new ScriptBundle("~/plugins/tinyMCEar").Include(
                "~/Scripts/plugins/tinyMCE/langs/ar.js"));

            bundles.Add(new ScriptBundle("~/plugins/tinyMCE").Include(
                "~/Scripts/plugins/tinyMCE/tinymce.min.js",
                "~/Scripts/plugins/tinyMCE/jquery.tinymce.min.js",
                "~/Scripts/plugins/tinyMCE/wysiwyg.js"));

            bundles.Add(new StyleBundle("~/Content/flags").Include(
                "~/Content/flags/docs.css",
                "~/Content/flags/flag-icon.min.css"));

            bundles.Add(new StyleBundle("~/Content/ShoppingStyle").Include(
                "~/Content/bootstrap.min.css",
                "~/Content/font-awesome.min.css",
                "~/Content/ShoppingStyle/magnific-popup.css",
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

            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                 "~/Scripts/jquery-{version}.js"));

            // toastr notification 
            bundles.Add(new ScriptBundle("~/plugins/toastr").Include(
                 "~/Scripts/plugins/toastr/toastr.min.js"));

            // toastr notification styles
            bundles.Add(new StyleBundle("~/plugins/toastrStyles").Include(
                 "~/Content/Admin/plugins/toastr/toastr.min.css"));

            // bootstarp
            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                 "~/Scripts/bootstrap.js",
                 "~/Scripts/respond.js"
                 ));

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
