using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.ModelConfiguration;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Resources;
using Swazer.ShoppingList.Core;
using System.ComponentModel;

namespace Swazer.ShoppingList.SqlServerRepository
{
    internal static class ThrowHelper
    {
        private static ResourceManager ResourceManager = new ResourceManager(typeof(RepositoryResource).FullName, typeof(RepositoryResource).Assembly);

        public static Exception ReThrow<T>(Exception ex)
        {
            SqlException sqlEx = TryExtractException<SqlException>(ex);
            DbUpdateException dbEx = TryExtractException<DbUpdateException>(ex);

            if (sqlEx != null)
            {
                //string exMessage = sqlEx.Message;

                string message = RepositoryResource.ErrorMessage_GeneralError;
                ErrorTypeEnum error = ErrorTypeEnum.None;
                string columnName = string.Empty;
                string tableName = string.Empty;
                string indexName = string.Empty;
                MatchCollection coll;

                switch (sqlEx.Number)
                {
                    case (2):
                    case (53):
                        //_error = DataAccessErrorType.NetworkAddressNotFound;
                        break;
                    case (547):
                        //if (sqlEx.Message.Contains("DELETE"))
                        //{
                        //    Match match = Regex.Match(sqlEx.Message, @"\'([^']*)\'");
                        //    coll = Regex.Matches(sqlEx.Message, "\"[^\"]*\"");
                        //    //if (match.Success)
                        //    //    columnName = match.Value.Substring(1, match.Value.Length - 2);

                        //    if (coll.Count == 3)
                        //        tableName = coll[2].Value.Substring(1, coll[2].Value.Length - 2);
                        //}
                        //error = ErrorTypeEnum.DeleteReferencedRecord;

                        //string tableNameCaption = ResourceManager.GetString(tableName.Replace('.', '_'));
                        //string entityNameCaption = typeof(T).Name;

                        //if (string.IsNullOrEmpty(tableNameCaption) || string.IsNullOrEmpty(entityNameCaption))
                        //    message = RepositoryResource.ErrorMessage_GeneralDependency;
                        //else
                        //    message = string.Format(RepositoryResource.ErrorMessage_TwoEntityDependency, tableNameCaption, entityNameCaption);

                        return new BusinessRuleException(RepositoryResource.ErrorMessage_GeneralDependency, RepositoryResource.ErrorMessage_GeneralDependency, typeof(T).Name, sqlEx);
                    case (4060):
                        //error = ErrorTypeEnum.InvalidDatabase;
                        break;
                    case (18452):
                    case (18456):
                        error = ErrorTypeEnum.LoginFailed;
                        message = RepositoryResource.ErrorMessage_LogingFailed;
                        break;
                    case (10054):
                        //_error = DataAccessErrorType.ConnectionRefused;
                        break;

                    case (2627):
                    case (2601):
                        error = ErrorTypeEnum.DuplicateValue;
                        message = "يجب أن لا يتكرر الحقل الفريد";
                        break;
                    default:
                        break;

                }

                if (sqlEx.Class == 20)
                {
                    error = ErrorTypeEnum.ConnectionFailed;
                    message = RepositoryResource.ErrorMessage_ConnectionFailed;
                }

                return new RepositoryException(typeof(T).Name, error, message, ex);
            }
            else if (ex is InvalidOperationException)
            {
                return new RepositoryException(typeof(T).Name, ErrorTypeEnum.None, ex.Message, ex);
            }
            else if (ex is DbUpdateConcurrencyException)
            {
                return new RepositoryException(typeof(T).Name, ErrorTypeEnum.ConcurrencyCheckFailed, "تم تعديل الكائن من قبل مستخدم آخر, يرجى تحديث المستعرض والمحاولة مرة آخرى", ex);
            }
            else if (ex is ModelValidationException)
            {
                return new RepositoryException(typeof(T).Name, ErrorTypeEnum.ValidationError, "يجب التأكد من أن قواعد التأكد من الصحة صحيحة", ex);
            }

            return ex;
        }

        public static T TryExtractException<T>(Exception ex)
            where T : Exception
        {
            while (ex != null && !(ex is T))
                ex = ex.InnerException;

            return ex as T;
        }
    }
}


