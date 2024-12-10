export const chartTypeDescriptions = {
  bar: {
    title: 'Bar Chart',
    description: 'Compare values across categories with vertical bars. Best for comparing discrete data points.',
    use: 'Use when comparing quantities across different categories.'
  },
  line: {
    title: 'Line Chart',
    description: 'Show trends over time or continuous data. Ideal for temporal data and trends.',
    use: 'Best for showing trends, changes over time, or continuous data.'
  },
  pie: {
    title: 'Pie Chart',
    description: 'Display parts of a whole. Shows proportional data as slices of a circle.',
    use: 'Use when showing proportions or percentages of a total.'
  },
  doughnut: {
    title: 'Doughnut Chart',
    description: 'Similar to pie chart but with a hollow center. Good for comparing proportions.',
    use: 'Alternative to pie charts, allows for additional information in the center.'
  },
  radar: {
    title: 'Radar Chart',
    description: 'Compare multiple variables. Shows data on multiple axes starting from the same point.',
    use: 'Good for comparing multiple variables or showing performance metrics.'
  },
  polarArea: {
    title: 'Polar Area Chart',
    description: 'Like a pie chart but shows values by area instead of arc length.',
    use: 'Best for showing relative sizes and proportions with emphasis on larger values.'
  },
  bubble: {
    title: 'Bubble Chart',
    description: 'Show three dimensions of data using x, y positions and bubble size.',
    use: 'Ideal for displaying three variables: two on axes and one by size.'
  },
  scatter: {
    title: 'Scatter Plot',
    description: 'Show correlation between two variables using points.',
    use: 'Best for showing relationships between two variables.'
  },
  area: {
    title: 'Area Chart',
    description: 'Like a line chart but with filled areas. Shows volume over time.',
    use: 'Good for showing cumulative totals over time.'
  },
  horizontalBar: {
    title: 'Horizontal Bar Chart',
    description: 'Like a bar chart but with horizontal bars. Good for long labels.',
    use: 'Best when category labels are long or you have many categories.'
  },
  stackedBar: {
    title: 'Stacked Bar Chart',
    description: 'Show parts of a whole within categories using stacked bars.',
    use: 'Good for showing composition within categories.'
  },
  stackedArea: {
    title: 'Stacked Area Chart',
    description: 'Show how multiple series add up to a total over time.',
    use: 'Best for showing how parts contribute to a whole over time.'
  },
  multiAxis: {
    title: 'Multi-Axis Chart',
    description: 'Compare different scales of data using multiple y-axes.',
    use: 'Good for comparing trends with different scales.'
  },
  combo: {
    title: 'Combo Chart',
    description: 'Combine different chart types (e.g., bar and line) in one visualization.',
    use: 'Best when showing related metrics that work better with different chart types.'
  }
}

export const colorSchemeDescriptions = {
  vibrant: 'Bold and energetic colors for high contrast and impact.',
  pastel: 'Soft, soothing colors for a gentle and calming visualization.',
  neon: 'Bright, eye-catching colors for emphasis and attention.',
  earth: 'Natural, earthy tones for a professional and grounded look.',
  ocean: 'Cool, calming blues for a professional and trustworthy feel.',
  sunset: 'Warm gradients inspired by sunset colors.',
  forest: 'Natural greens for environmental or growth-related data.',
  monochrome: 'Professional grayscale for formal presentations.',
  rainbow: 'Full spectrum of colors for maximum differentiation.',
  gradient: 'Smooth color transitions for a modern look.'
}

export const analyticsFeatureDescriptions = {
  trendline: {
    title: 'Trend Analysis',
    description: 'Shows the general direction and pattern in your data.',
    features: [
      'Linear and non-linear trend detection',
      'Confidence intervals',
      'R-squared value for fit quality',
      'Future trend projections'
    ]
  },
  forecast: {
    title: 'Forecasting',
    description: 'Predicts future values based on historical patterns.',
    features: [
      'Short-term predictions',
      'Confidence ranges',
      'Seasonal adjustments',
      'Trend-based projections'
    ]
  },
  statistics: {
    title: 'Statistical Analysis',
    description: 'Comprehensive statistical insights about your data.',
    features: [
      'Basic statistics (mean, median, mode)',
      'Distribution analysis',
      'Outlier detection',
      'Variance and standard deviation'
    ]
  },
  insights: {
    title: 'AI Insights',
    description: 'Automated analysis and insights about your data.',
    features: [
      'Pattern detection',
      'Anomaly identification',
      'Correlation analysis',
      'Natural language insights'
    ]
  },
  timeSeries: {
    title: 'Time Series Analysis',
    description: 'Advanced analysis for time-based data.',
    features: [
      'Seasonality detection',
      'Trend decomposition',
      'Cycle identification',
      'Period analysis'
    ]
  }
}

export const interactiveFeatureDescriptions = {
  export: {
    title: 'Export Options',
    description: 'Save and share your visualizations.',
    features: [
      'Download as PNG image',
      'Export data as CSV',
      'Copy chart as image',
      'Share link generation'
    ]
  },
  customize: {
    title: 'Customization Options',
    description: 'Personalize your chart appearance.',
    features: [
      'Color scheme selection',
      'Axis label customization',
      'Title editing',
      'Legend positioning'
    ]
  },
  dataControls: {
    title: 'Data Controls',
    description: 'Manipulate how your data is displayed.',
    features: [
      'Sort data (ascending/descending)',
      'Filter outliers',
      'Group data points',
      'Aggregate values'
    ]
  },
  animation: {
    title: 'Animation Controls',
    description: 'Control chart animations and transitions.',
    features: [
      'Enable/disable animations',
      'Animation speed control',
      'Transition effects',
      'Interactive highlights'
    ]
  }
} 