using System;
using System.Diagnostics;

namespace PerfSurf.Counters
{
	public class PerfCounterWrapper
	{
		private readonly PerformanceCounter _counter;
		public string Name { get; }
		public float Value => _counter.NextValue();
		public PerfCounterWrapper(string name, string category, string counter, string instance = "")
		{
			Name = name;
			try
			{
				_counter = new PerformanceCounter(category, counter, instance, readOnly: true);
			}
			catch (Exception exc)
			{
				Debug.Print(exc.Message);
				//throw;
			}
		}
	}
}