﻿using Swazer.ShoppingList.Core;
using System.Collections.Generic;

namespace Swazer.ShoppingList.RepositoryInterface
{
    public interface ICartRepository
    {
        List<CartObject> FetchCards(CartMobileSearchCriteria criteria);

        void UpdateOrder(int userId, int cartId, int destination);
    }
}
