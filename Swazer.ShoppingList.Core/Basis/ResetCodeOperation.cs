using HashidsNet;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.Core
{
    public class ResetCodeOperation
    {
        private static Hashids hashIds;
        private static int[] getRandomCode()
        {
            int min = 0;
            int max = 50;
            Random random = new Random();
            int[] randomNumbers = Enumerable
                .Repeat(0, 2)
                .Select(i => random.Next(min, max))
                .ToArray();

            return randomNumbers;
        }

        static ResetCodeOperation()
        {
            hashIds = new Hashids(minHashLength: 5, alphabet: "ABCDEFCHIJKLMNOPQRSTUVWXYZ23456789");
        }

        public static string ProduceUserResetCode()
        {
            int[] randomCode = getRandomCode();

            return hashIds.Encode(randomCode);
        }
    }
}
