import { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Star,
  MessageSquare,
  Sparkles,
  Heart,
  BookOpen,
  Compass,
  CheckCircle2,
  Clock,
  Send,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useFarmerReviews,
  FarmerReviewItem,
} from '@/hooks/useFarmerReviews';

type FilterTab = 'all' | 'needs_reply' | '5_star' | 'constructive';

export function FarmerReputationHub() {
  const { reviews, metrics, isLoading, isSubmittingResponse, submitResponse } = useFarmerReviews();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((item) => {
      // Tab filter
      if (activeTab === 'needs_reply' && item.response) return false;
      if (activeTab === '5_star' && item.farmer_rating < 5) return false;
      if (activeTab === 'constructive' && item.farmer_rating > 3) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const guestName = (item.reviewer.full_name || '').toLowerCase();
        const comment = (item.farmer_comment || '').toLowerCase();
        const propName = (item.property_name || '').toLowerCase();
        return guestName.includes(q) || comment.includes(q) || propName.includes(q);
      }

      return true;
    });
  }, [reviews, activeTab, searchQuery]);

  const handleStartReply = (review: FarmerReviewItem) => {
    setReplyingToId(review.id);
    if (review.response) {
      setReplyContent(review.response.content);
    } else {
      setReplyContent('');
    }
  };

  const handleApplyPreset = (preset: string, guestName: string) => {
    const formatted = preset.replace('{name}', guestName.split(' ')[0] || 'po');
    setReplyContent(formatted);
  };

  const handleSendResponse = async (reviewId: string) => {
    if (!replyContent.trim()) return;
    const success = await submitResponse(reviewId, replyContent);
    if (success) {
      setReplyingToId(null);
      setReplyContent('');
    }
  };

  if (isLoading) {
    return <FarmerReputationSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Scope Disclaimer Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm sm:text-base flex items-center gap-1.5">
              Personal Hospitality & Guide Reviews
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[11px] font-medium">
                The Person, Not the Place
              </Badge>
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              These reviews evaluate your personal hospitality, agricultural knowledge, and guest care.
              Facilities and physical accommodations are reviewed separately under your Farm Profile.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Hospitality Scorecard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Big Rating & Status */}
        <Card className="lg:col-span-4 border-primary/20 shadow-sm bg-gradient-to-br from-card to-primary/[0.03]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-primary text-primary-foreground text-xs font-semibold gap-1 px-2.5 py-0.5">
                <Award className="h-3.5 w-3.5" />
                Verified Host Reputation
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {metrics.totalReviews} {metrics.totalReviews === 1 ? 'tribute' : 'tributes'}
              </span>
            </div>
            <CardTitle className="font-display text-lg mt-3">Personal Hospitality Score</CardTitle>
            <CardDescription className="text-xs">Based on direct guest feedback</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-5xl font-bold tracking-tight text-foreground">
                {metrics.averageRating.toFixed(1)}
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(metrics.averageRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-muted text-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Top 5% Host Hospitality
                </p>
              </div>
            </div>

            {/* Response Rate & Stats Grid */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Response Rate</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{metrics.responseRate}%</p>
                <p className="text-[11px] text-muted-foreground">Public replies</p>
              </div>
              <div
                onClick={() => setActiveTab('needs_reply')}
                className={`rounded-lg p-3 transition-colors cursor-pointer border ${
                  metrics.pendingRepliesCount > 0
                    ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15'
                    : 'bg-muted/50 border-transparent'
                }`}
              >
                <p className="text-xs text-muted-foreground">Awaiting Reply</p>
                <p
                  className={`text-xl font-bold mt-0.5 ${
                    metrics.pendingRepliesCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'
                  }`}
                >
                  {metrics.pendingRepliesCount}
                </p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                  Click to reply <ArrowUpRight className="h-3 w-3" />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: 4 Hospitality Traits */}
        <Card className="lg:col-span-8 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Hospitality Pillars & Guest Tributes
            </CardTitle>
            <CardDescription className="text-xs">
              How guests score your agricultural storytelling, care, and guidance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Trait 1: Storytelling */}
              <div className="rounded-xl border p-4 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Storytelling & Heritage
                  </span>
                  <span className="text-sm font-semibold text-primary">{metrics.traits.storytellingPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${metrics.traits.storytellingPct}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Grafting tips, farming history, and terroir knowledge
                </p>
              </div>

              {/* Trait 2: Warmth & Care */}
              <div className="rounded-xl border p-4 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Heart className="h-4 w-4 text-rose-500" />
                    Warmth & Malasakit
                  </span>
                  <span className="text-sm font-semibold text-rose-600">{metrics.traits.warmthPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${metrics.traits.warmthPct}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Morning welcomes, native treats, and family friendliness
                </p>
              </div>

              {/* Trait 3: Communication */}
              <div className="rounded-xl border p-4 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    Communication & Clarity
                  </span>
                  <span className="text-sm font-semibold text-blue-600">{metrics.traits.communicationPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${metrics.traits.communicationPct}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Check-in directions, timely replies, and weather updates
                </p>
              </div>

              {/* Trait 4: Guidance & Safety */}
              <div className="rounded-xl border p-4 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Compass className="h-4 w-4 text-amber-500" />
                    Field Guidance & Safety
                  </span>
                  <span className="text-sm font-semibold text-amber-600">{metrics.traits.guidancePct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${metrics.traits.guidancePct}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Trail walks, honey bee handling, and farm hazard briefing
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Management Feed */}
      <div className="space-y-5">
        {/* Controls: Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tab Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg overflow-x-auto">
            <Button
              variant={activeTab === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('all')}
              className="text-xs h-8"
            >
              All Tributes ({reviews.length})
            </Button>
            <Button
              variant={activeTab === 'needs_reply' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('needs_reply')}
              className={`text-xs h-8 ${
                activeTab !== 'needs_reply' && metrics.pendingRepliesCount > 0 ? 'text-amber-600 font-medium' : ''
              }`}
            >
              Needs Reply {metrics.pendingRepliesCount > 0 && `(${metrics.pendingRepliesCount})`}
            </Button>
            <Button
              variant={activeTab === '5_star' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('5_star')}
              className="text-xs h-8"
            >
              5-Star Praise ({metrics.fiveStarCount})
            </Button>
            <Button
              variant={activeTab === 'constructive' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('constructive')}
              className="text-xs h-8"
            >
              Constructive (≤3★)
            </Button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by guest or quote…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="h-12 w-12 rounded-full bg-muted mx-auto flex items-center justify-center text-muted-foreground mb-3">
                <Filter className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base mb-1">No reviews found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                {searchQuery
                  ? `No reviews match "${searchQuery}". Try clearing your search.`
                  : activeTab === 'needs_reply'
                  ? 'Great job! You have replied to all guest tributes.'
                  : 'There are no reviews under this filter.'}
              </p>
              {(searchQuery || activeTab !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveTab('all');
                    setSearchQuery('');
                  }}
                >
                  Reset filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <FarmerReviewCard
                key={review.id}
                review={review}
                isReplying={replyingToId === review.id}
                replyContent={replyContent}
                isSubmitting={isSubmittingResponse}
                onStartReply={() => handleStartReply(review)}
                onCancelReply={() => {
                  setReplyingToId(null);
                  setReplyContent('');
                }}
                onChangeReplyContent={setReplyContent}
                onApplyPreset={(preset) => handleApplyPreset(preset, review.reviewer.full_name)}
                onSubmitReply={() => handleSendResponse(review.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Individual Review Card focused on the person
interface FarmerReviewCardProps {
  review: FarmerReviewItem;
  isReplying: boolean;
  replyContent: string;
  isSubmitting: boolean;
  onStartReply: () => void;
  onCancelReply: () => void;
  onChangeReplyContent: (val: string) => void;
  onApplyPreset: (preset: string) => void;
  onSubmitReply: () => void;
}

function FarmerReviewCard({
  review,
  isReplying,
  replyContent,
  isSubmitting,
  onStartReply,
  onCancelReply,
  onChangeReplyContent,
  onApplyPreset,
  onSubmitReply,
}: FarmerReviewCardProps) {
  const reviewerInitials = (review.reviewer.full_name || 'Guest')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2);

  const formattedDate = formatDistanceToNow(new Date(review.created_at), { addSuffix: true });

  const presets = [
    {
      label: '🌱 Harvest Joy & Gratitude',
      text: 'Maraming salamat po {name}! It was an absolute honor hosting you and sharing our farm story. We look forward to welcoming you back during harvest season!',
    },
    {
      label: '🥭 Orchard Walk Thanks',
      text: 'Thank you so much {name}! We are delighted that you enjoyed walking the orchards with us. Give our warmest regards to your family!',
    },
    {
      label: '💬 Constructive Acknowledgment',
      text: 'Thank you for your honest feedback, {name}. We truly appreciate your comments and will ensure check-in communication is even smoother next time.',
    },
  ];

  return (
    <Card className="overflow-hidden border transition-all hover:border-primary/30">
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Top Bar: Reviewer Info, Stay, Rating */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={review.reviewer.avatar_url || ''} alt={review.reviewer.full_name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                {reviewerInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm text-foreground">{review.reviewer.full_name}</h4>
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-primary" /> Verified Stay
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {review.property_name} • {formattedDate}
              </p>
            </div>
          </div>

          {/* Farmer Hospitality Rating Badge */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-muted/40 px-3 py-1.5 rounded-lg">
            <span className="text-xs font-medium text-muted-foreground">Host Rating:</span>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < review.farmer_rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-foreground ml-1">{review.farmer_rating}.0</span>
          </div>
        </div>

        {/* The Personal Tribute Quote (The Human Connection) */}
        <div className="rounded-xl bg-primary/[0.03] border-l-4 border-l-primary p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1">
              <Heart className="h-3 w-3 fill-primary/30" /> Personal Host Feedback
            </span>
            {review.sub_scores && (
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground">
                {review.sub_scores.storytelling && <span>🌾 Storytelling {review.sub_scores.storytelling}★</span>}
                {review.sub_scores.warmth && <span>🤝 Warmth {review.sub_scores.warmth}★</span>}
              </div>
            )}
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed italic">
            "{review.farmer_comment || 'The host provided exceptional personal warmth during our visit.'}"
          </p>
        </div>

        {/* Response Section */}
        {review.response ? (
          /* Already Responded */
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2 ml-2 sm:ml-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[11px]">
                  Official Host Response
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(review.response.created_at), { addSuffix: true })}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 text-muted-foreground hover:text-foreground"
                onClick={onStartReply}
              >
                Edit Reply
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">{review.response.content}</p>
          </div>
        ) : isReplying ? (
          /* Inline Reply Composer */
          <div className="rounded-xl border border-primary/30 bg-card p-4 space-y-3 ml-2 sm:ml-6 animate-in fade-in-50">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                Reply as Host to {review.reviewer.full_name}
              </h5>
              <span className="text-[11px] text-muted-foreground">Public response</span>
            </div>

            {/* Quick 1-Tap Presets */}
            <div className="space-y-1.5">
              <p className="text-[11px] text-muted-foreground font-medium">Quick response presets for busy farmers:</p>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((preset, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-[11px] h-7 px-2.5 bg-muted/40 hover:bg-muted"
                    onClick={() => onApplyPreset(preset.text)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Response Textarea */}
            <Textarea
              rows={3}
              placeholder={`Write a gracious, professional reply to ${review.reviewer.full_name}…`}
              value={replyContent}
              onChange={(e) => onChangeReplyContent(e.target.value)}
              className="text-xs resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-muted-foreground">
                Your reply helps future travelers appreciate your farm hospitality.
              </p>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onCancelReply} className="text-xs h-8">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={onSubmitReply}
                  disabled={!replyContent.trim() || isSubmitting}
                  className="text-xs h-8 gap-1.5 bg-primary hover:bg-primary/90"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isSubmitting ? 'Publishing…' : 'Publish Reply'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Reply Call To Action */
          <div className="flex items-center justify-between pt-1 ml-2 sm:ml-6">
            <p className="text-xs text-muted-foreground italic flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              Not answered yet. Replying within 48h boosts your hospitality rating.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onStartReply}
              className="text-xs h-8 gap-1.5 hover:border-primary hover:text-primary"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Write Reply
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Skeleton loading component
function FarmerReputationSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20 w-full rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Skeleton className="lg:col-span-4 h-64 rounded-xl" />
        <Skeleton className="lg:col-span-8 h-64 rounded-xl" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-72 rounded-lg" />
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-44 w-full rounded-xl" />
      </div>
    </div>
  );
}
