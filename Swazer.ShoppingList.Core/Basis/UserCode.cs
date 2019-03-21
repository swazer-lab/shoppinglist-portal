using HashidsNet;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.Core
{
    public class UserCodeOperation
    {
        private static Hashids hashIds;

        static UserCodeOperation()
        {
            hashIds = new Hashids(salt: "shoppinglist", minHashLength: 30);
        }

        public static string ProduceCode(params int[] values)
        {
            return hashIds.Encode(values);
        }

        public static int[] DecodeCode(string code)
        {
            return hashIds.Decode(code);
        }
    }
}
