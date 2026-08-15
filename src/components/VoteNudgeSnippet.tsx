import VotePoll from './VotePoll';

interface VoteNudgeSnippetProps {
  fixtureId: string | number;
  prediction?: string;
  homeTeam?: string;
  awayTeam?: string;
  status?: string;
  result?: string;
  isEnded?: boolean;
  onExpand?: () => void;
  variant?: 'compact' | 'card' | 'desktop-row';
  className?: string;
}

export default function VoteNudgeSnippet({
  fixtureId,
  prediction,
  homeTeam,
  awayTeam,
  status,
  result,
  isEnded,
  onExpand,
  variant = 'compact',
  className = ''
}: VoteNudgeSnippetProps) {
  const pollVariant = variant === 'card' ? 'card' : 'compact';

  return (
    <VotePoll
      fixtureId={fixtureId}
      prediction={prediction}
      homeTeam={homeTeam}
      awayTeam={awayTeam}
      status={status}
      result={result}
      isEnded={isEnded}
      variant={pollVariant}
      onExpand={onExpand}
      className={className}
    />
  );
}
