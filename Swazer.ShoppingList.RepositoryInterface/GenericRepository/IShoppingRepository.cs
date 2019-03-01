using Swazer.ShoppingList.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.RepositoryInterface
{
    public interface IShoppingRepository
    {
        List<SubjectPureModel> GetSubjects();
    }
}
