interface ItemSummary {
  category: string;
  completed: boolean;
}

export interface RecommendationResult {
  category: string;
  label: string;
  cluster: number;
  clusterName: string;
}

const CENTROIDS = [
  [0.15, 0.10, 0.10, 0.10, 0.95],
  [0.80, 0.25, 0.20, 0.50, 0.95],
  [0.90, 0.85, 0.75, 0.80, 0.95],
];

const CLUSTER_NAMES = ['Beginner', 'Active Preparer', 'Advanced'];
const CLUSTER_CATEGORIES = ['Basic', 'Gear', 'Health'];
const CLUSTER_LABELS = [
  'Start with the essentials',
  'Level up your gear kit',
  'Complete your health preparation',
];

function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum = sum + diff * diff;
  }
  return Math.sqrt(sum);
}

function pctCompleted(items: ItemSummary[], category: string): number {
  const filtered = items.filter(function(item) { return item.category === category; });
  if (filtered.length === 0) { return 0; }
  const done = filtered.filter(function(item) { return item.completed; });
  return done.length / filtered.length;
}

export function recommend(
  items: ItemSummary[],
  streakCount: number,
): RecommendationResult {
  const pctBasic = pctCompleted(items, 'Basic');
  const pctGear = pctCompleted(items, 'Gear');
  const pctHealth = pctCompleted(items, 'Health');
  const normStreak = Math.min(streakCount / 30, 1.0);
  const normRecency = 1.0;

  const vector = [pctBasic, pctGear, pctHealth, normStreak, normRecency];

  let minDistance = Infinity;
  let assignedCluster = 0;

  for (let i = 0; i < CENTROIDS.length; i++) {
    const distance = euclideanDistance(vector, CENTROIDS[i]);
    if (distance < minDistance) {
      minDistance = distance;
      assignedCluster = i;
    }
  }

  return {
    category: CLUSTER_CATEGORIES[assignedCluster],
    label: CLUSTER_LABELS[assignedCluster],
    cluster: assignedCluster,
    clusterName: CLUSTER_NAMES[assignedCluster],
  };
}
