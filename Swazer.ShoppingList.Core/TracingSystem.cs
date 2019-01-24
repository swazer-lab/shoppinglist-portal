using System;
using System.Diagnostics;

namespace Swazer.ShoppingList.Core
{
    // read this very helpful blog for more information about TracingSource
    // https://blogs.msdn.microsoft.com/bclteam/2005/03/15/a-tracing-primer-part-i-mike-rousos/
    public static class TracingSystem
    {
        private static readonly TraceSource logger = new TraceSource("Tracer");

        public static void TraceException(Exception ex)
        {
            logger.TraceEvent(TraceEventType.Error, 3, ex.ToString());
        }

        public static void TraceException(string message, Exception ex)
        {
            logger.TraceEvent(TraceEventType.Error, 3, message + Environment.NewLine + ex);
        }

        public static void TraceError(string message)
        {
            logger.TraceEvent(TraceEventType.Error, 4, message);
        }

        public static void TraceCriticalError(string message)
        {
            logger.TraceEvent(TraceEventType.Critical, 5, message);
        }

        public static void TraceInformation(string message)
        {
            logger.TraceEvent(TraceEventType.Information, 6, message);
        }
    }
}
