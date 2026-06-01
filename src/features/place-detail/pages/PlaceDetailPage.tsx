import { Suspense, lazy } from "react";
import {
  ArrowLeft,
  Star,
  MapPin,
  ExternalLink,
  Heart,
  MessageSquare,
  ThumbsUp,
  Globe,
  Flag,
  Phone,
  Wifi,
  Toilet,
  ParkingSquare,
  UtensilsCrossed,
  CalendarCheck,
  Users,
  Accessibility,
  Images,
  Mail,
  Share2,
  Truck,
  Car,
  CreditCard,
  Smartphone,
  ChefHat,
  Ear,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { usePlaceDetailPage } from "@/features/place-detail/hooks/usePlaceDetailPage";
import { getDefaultVenueImageDataUrl } from "@/features/place-detail/utils/defaultImages";
import { formatCountLabel } from "@/features/place-detail/utils/formatters";
import {
  PLACE_DETAIL_FACILITY_BADGE_CLASS,
  shouldShowAccessibleBadge,
} from "@/features/place-detail/utils/placeDetailPresentation";
import { ReviewSkeleton } from "@/features/place-detail/components/ReviewSkeleton";
import { ReviewsPagination } from "@/features/place-detail/components/ReviewsPagination";
import { OpenHoursCard } from "@/features/place-detail/components/OpenHoursCard";
import { MetroStationsCard } from "@/features/place-detail/components/MetroStationsCard";
import "@/features/place-detail/placeDetailTypography.css";

const ReviewCardLazy = lazy(() =>
  import("@/features/place-detail/components/ReviewCard").then((module) => ({
    default: module.ReviewCard,
  })),
);

const SocialReviewCardLazy = lazy(() =>
  import("@/features/place-detail/components/SocialReviewCard").then(
    (module) => ({
      default: module.SocialReviewCard,
    }),
  ),
);

const AddReviewFormLazy = lazy(() =>
  import("@/features/place-detail/components/AddReviewForm").then((module) => ({
    default: module.AddReviewForm,
  })),
);

const MenuImageGalleryLazy = lazy(() =>
  import("@/features/place-detail/components/MenuImageGallery").then(
    (module) => ({
      default: module.MenuImageGallery,
    }),
  ),
);

const PlaceDetailPage = () => {
  const page = usePlaceDetailPage();
  const { place, chrome } = page;

  if (page.loading) {
    return (
      <LoadingSpinner
        size="md"
        text={page.t("placeDetail.loading")}
        fullScreen={true}
      />
    );
  }

  if (page.error || !place) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4">
          <Alert variant="destructive" className="border-destructive/30">
            <AlertTitle>{page.t("placeDetail.error.openTitle")}</AlertTitle>
            <AlertDescription className="break-words">
              {page.error || page.t("placeDetail.error.notFound")}
            </AlertDescription>
          </Alert>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full"
            onClick={() => void page.refreshPlaceData()}
          >
            {page.t("common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-background via-background to-muted/30 pb-[calc(6.25rem+env(safe-area-inset-bottom))] sm:pb-10">
      {page.notification.show && (
        <div
          className="fixed top-[calc(1rem+env(safe-area-inset-top))] left-1/2 z-50 -translate-x-1/2 px-4 w-full max-w-[min(92vw,32rem)]"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <Card
            className={cn(
              "animate-in fade-in slide-in-from-top-2 duration-500 max-w-[min(92vw,32rem)] px-4 py-3 rounded-2xl border shadow-xl",
              chrome.notificationToneClass,
            )}
          >
            <div className="flex items-center gap-3">
              {page.notification.type === "like" ? (
                <ThumbsUp className="h-5 w-5 fill-current" />
              ) : page.notification.type === "report" ? (
                <Flag className="h-5 w-5 fill-current" />
              ) : (
                <Heart className="h-5 w-5 fill-current" />
              )}
              <span className="pd-type-label font-semibold break-words">
                {page.t(page.notificationMessageKey)}
              </span>
            </div>
          </Card>
        </div>
      )}

      <div className="mx-auto w-full max-w-6xl min-w-0 px-4 pt-4 sm:px-6 lg:px-8">
        <Card className="overflow-hidden rounded-3xl border-border/60 shadow-xl max-w-full">
          <div className="relative h-[clamp(12rem,44vw,24rem)] sm:h-[clamp(15rem,48vw,24rem)]">
            <img
              src={place.image}
              alt={place.name}
              className="h-full w-full object-cover"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onError={(event) => {
                event.currentTarget.src = getDefaultVenueImageDataUrl(place.name);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/35 to-black/10" />

            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={page.t("placeDetail.action.goBack")}
              onClick={page.goBack}
              className="absolute start-3 top-3 h-10 w-10 rounded-full border-border/60 bg-card/90 text-foreground backdrop-blur-sm sm:start-4 sm:top-4 sm:h-11 sm:w-11"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {!chrome.isPrivilegedUser && (
              <div className="absolute end-3 top-3 flex items-center gap-1.5 sm:end-4 sm:top-4 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => void page.toggleLike()}
                  disabled={page.savingLike}
                  aria-label={
                    page.isLiked
                      ? page.t("placeDetail.action.unlike")
                      : page.t("placeDetail.action.like")
                  }
                  aria-pressed={page.isLiked}
                  className="h-10 w-10 rounded-full border-border/60 bg-card/90 backdrop-blur-sm sm:h-11 sm:w-11"
                  title={
                    page.isLiked
                      ? page.t("placeDetail.action.unlike")
                      : page.t("placeDetail.action.like")
                  }
                >
                  <ThumbsUp
                    className={cn(
                      "h-5 w-5 transition-colors",
                      page.isLiked ? "text-accent fill-accent" : "text-foreground",
                    )}
                  />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => void page.sharePlace()}
                  aria-label={page.t("placeDetail.action.share")}
                  className="h-10 w-10 rounded-full border-border/60 bg-card/90 backdrop-blur-sm sm:h-11 sm:w-11"
                  title={page.t("placeDetail.action.share")}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => void page.toggleFavorite()}
                  disabled={page.savingFavorite}
                  aria-label={
                    page.isFavorite
                      ? page.t("home.place.removeFavorite")
                      : page.t("home.place.addFavorite")
                  }
                  aria-pressed={page.isFavorite}
                  className="h-10 w-10 rounded-full border-border/60 bg-card/90 backdrop-blur-sm sm:h-11 sm:w-11"
                  title={
                    page.isFavorite
                      ? page.t("home.place.removeFavorite")
                      : page.t("home.place.addFavorite")
                  }
                >
                  <Heart
                    className={cn(
                      "h-5 w-5 transition-colors",
                      page.isFavorite
                        ? "text-accent fill-accent"
                        : "text-foreground",
                    )}
                  />
                </Button>
              </div>
            )}
          </div>
        </Card>

        <div className="mt-6 space-y-5 min-w-0 max-w-full">
          <Card className="rounded-2xl border-border/70 bg-card/95 p-4 shadow-sm sm:p-5 max-w-full overflow-hidden">
            <div className="space-y-4">
              <div className="flex flex-row flex-wrap items-start justify-between gap-x-3 gap-y-2">
                <h1
                  className="text-role-heading text-foreground break-words min-w-0 flex-1 basis-[min(100%,12rem)]"
                  dir="auto"
                >
                  {place.name}
                </h1>
                <Badge
                  variant="outline"
                  className="gap-1 border-accent/40 text-accent shrink-0 pd-type-number self-start"
                >
                  <Star className="h-3 w-3 fill-accent text-accent" />
                  {chrome.formattedAverageRating}
                </Badge>
              </div>

              <div className="flex items-center gap-2 pd-type-label text-muted-foreground min-w-0">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="break-words" dir="auto">
                  {place.address}
                </span>
              </div>

              {(place.district || place.type || place.category) && (
                <div className="flex items-center gap-2 flex-wrap pd-type-micro text-muted-foreground">
                  {place.category && (
                    <Badge
                      variant="outline"
                      className="font-semibold border-border/80"
                    >
                      {place.category}
                    </Badge>
                  )}
                  {place.type && (
                    <Badge
                      variant="outline"
                      className="font-semibold border-border/80"
                    >
                      {place.type}
                    </Badge>
                  )}
                  {place.district && <span>{place.district}</span>}
                </div>
              )}

              {(chrome.priceMeta ||
                place.priceRangeDisplay ||
                place.priceMeanPerPerson) && (
                <div className="flex items-center gap-3 flex-wrap text-role-secondary text-muted-foreground">
                  {chrome.priceMeta && (
                    <span className="inline-flex items-center gap-1 font-semibold text-accent">
                      <span>{chrome.priceMeta.label}</span>
                      <span className="pd-type-micro text-accent/90">
                        {chrome.priceMeta.symbol}
                      </span>
                    </span>
                  )}
                  {!chrome.priceMeta && place.priceRangeDisplay && (
                    <span className="font-semibold text-accent">
                      {place.priceRangeDisplay}
                    </span>
                  )}
                  {typeof place.priceMeanPerPerson === "number" &&
                    Number.isFinite(place.priceMeanPerPerson) && (
                      <span className="pd-type-micro text-muted-foreground">
                        {place.menuCurrency?.trim()
                          ? page.t("placeDetail.price.perPersonWithCurrency", {
                              amount: page.formatNumber(place.priceMeanPerPerson),
                              currency: place.menuCurrency.trim(),
                            })
                          : page.t("placeDetail.price.perPerson", {
                              amount: page.formatNumber(place.priceMeanPerPerson),
                            })}
                      </span>
                    )}
                </div>
              )}

              {chrome.tagLabels.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {chrome.tagLabels.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="gap-1 pd-type-micro border-border/80 bg-muted/50 text-muted-foreground"
                      dir="auto"
                    >
                      <ChefHat className="h-3 w-3 shrink-0" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {(place.atmosphereTags ?? []).length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {place.atmosphereTags!.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="pd-type-micro border-border/80 bg-muted/50 text-muted-foreground"
                      dir="auto"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {(place.socialBadges ?? []).length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {place.socialBadges!.map((item) => (
                    <Badge
                      key={item}
                      variant="outline"
                      className="gap-1 border-accent/35 bg-accent/10 text-accent"
                    >
                      <Users className="h-3 w-3" />
                      {item}
                    </Badge>
                  ))}
                  {shouldShowAccessibleBadge(
                    chrome.hasWheelchairAccess,
                    place.accessibilityScore,
                  ) && (
                    <Badge
                      variant="outline"
                      className="gap-1 border-accent/35 bg-accent/10 text-accent"
                    >
                      <Accessibility className="h-3 w-3" />
                      {page.t("placeDetail.badge.accessible")}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </Card>

          <div className="grid gap-5 min-w-0 max-w-full lg:grid-cols-2">
            {chrome.hasDescription && (
              <Card className="rounded-2xl border-border/70 bg-card/95 p-4 shadow-sm space-y-2 sm:p-5 lg:col-span-2">
                <h2 className="pd-type-kicker text-foreground">
                  {page.t("placeDetail.about")}
                </h2>
                <p className="pd-type-body pd-measure pd-contain-width text-muted-foreground break-words">
                  {chrome.descriptionText}
                </p>
              </Card>
            )}

            {chrome.hasHoursData && (
              <OpenHoursCard
                hoursText={chrome.hoursText}
                isOpen={place.isOpen}
                isArabic={page.isArabic}
                t={page.t}
              />
            )}

            {(place.phone ||
              place.website ||
              place.bookingUrl ||
              place.originalGoogleMapsUrl) && (
              <Card className="rounded-2xl border-border/70 bg-card/95 p-4 shadow-sm space-y-3 sm:p-5">
                <h2 className="pd-type-kicker text-foreground inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 text-accent" />
                  {page.t("placeDetail.contact")}
                </h2>
                <div className="flex flex-col gap-2.5">
                  {place.phone && (
                    <a
                      href={`tel:${place.phone}`}
                      className="inline-flex min-h-11 w-full min-w-0 items-center gap-2 pd-type-label pd-focus-ring text-muted-foreground hover:text-foreground transition-colors break-all"
                    >
                      <Phone className="h-4 w-4 text-accent shrink-0" />
                      {place.phone}
                    </a>
                  )}
                  {place.website && (
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={page.trackExternalClick}
                      className="inline-flex min-h-11 w-full min-w-0 items-center gap-2 pd-type-label pd-focus-ring text-accent hover:underline break-all"
                    >
                      <Globe className="h-4 w-4 shrink-0" />
                      {page.t("placeDetail.contact.visitWebsite")}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {place.bookingUrl && (
                    <a
                      href={place.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={page.trackExternalClick}
                      className="inline-flex min-h-11 w-full min-w-0 items-center gap-2 pd-type-label pd-focus-ring text-accent hover:underline"
                    >
                      <CalendarCheck className="h-4 w-4 shrink-0" />
                      {page.t("placeDetail.contact.bookTable")}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {place.originalGoogleMapsUrl && (
                    <a
                      href={place.originalGoogleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={page.trackExternalClick}
                      className="inline-flex min-h-11 w-full min-w-0 items-center gap-2 pd-type-label pd-focus-ring text-accent hover:underline break-all"
                    >
                      <MapPin className="h-4 w-4 shrink-0" />
                      {page.t("placeDetail.contact.googleMaps")}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </Card>
            )}

            {chrome.shouldShowMenuCard && (
              <Card className="rounded-2xl border-border/70 bg-card/95 p-4 shadow-sm flex flex-col gap-3 sm:p-5">
                <div className="flex items-center gap-3 min-w-0">
                  <UtensilsCrossed className="h-5 w-5 text-accent shrink-0" />
                  <div>
                    <p className="pd-type-label text-foreground">
                      {page.t("placeDetail.menu")}
                    </p>
                    {chrome.menuImagesCount > 0 && (
                      <p className="pd-type-micro pd-type-number text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                        <Images className="h-3 w-3" />
                        {formatCountLabel(
                          chrome.menuImagesCount,
                          page.t("placeDetail.menuPhotoSingular"),
                          page.t("placeDetail.menuPhotoPlural"),
                        )}{" "}
                        {page.t("placeDetail.available")}
                      </p>
                    )}
                  </div>
                </div>

                {chrome.menuItems.length > 0 && (
                  <Suspense
                    fallback={
                      <div className="h-28 rounded-xl bg-muted/50 animate-pulse" />
                    }
                  >
                    <MenuImageGalleryLazy
                      items={chrome.menuItems}
                      placeName={place.name}
                      onImageOpen={page.trackPhotoView}
                    />
                  </Suspense>
                )}

                {!chrome.hasMenuData && (
                  <p className="pd-type-micro text-muted-foreground">
                    {page.t("placeDetail.menu.unavailable")}
                  </p>
                )}
                {place.menuUrl && (
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Button
                      asChild
                      variant="secondary"
                      className="min-h-11 w-full sm:w-auto"
                    >
                      <a
                        href={place.menuUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={page.trackPhotoView}
                      >
                        {page.t("placeDetail.menu.view")}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {chrome.nearestMetroStations.length > 0 && (
              <MetroStationsCard stations={chrome.nearestMetroStations} />
            )}

            {chrome.showFacilitiesCard && (
              <Card className="rounded-2xl border-border/70 bg-card/95 p-4 shadow-sm space-y-3 sm:p-5 lg:col-span-2">
                <h2 className="pd-type-kicker text-foreground">
                  {page.t("placeDetail.facilities")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {place.freeWifi && (
                    <Badge variant="outline" className={PLACE_DETAIL_FACILITY_BADGE_CLASS}>
                      <Wifi className="h-3.5 w-3.5" />
                      {page.t("placeDetail.facilities.wifi")}
                    </Badge>
                  )}
                  {place.hasWifi && !place.freeWifi && (
                    <Badge variant="outline" className={PLACE_DETAIL_FACILITY_BADGE_CLASS}>
                      <Wifi className="h-3.5 w-3.5" />
                      {page.t("placeDetail.facilities.wifiAvailable")}
                    </Badge>
                  )}
                  {place.hasToilet && (
                    <Badge variant="outline" className={PLACE_DETAIL_FACILITY_BADGE_CLASS}>
                      <Toilet className="h-3.5 w-3.5" />
                      {page.t("placeDetail.facilities.restrooms")}
                    </Badge>
                  )}
                  {place.offersDelivery && (
                    <Badge variant="outline" className={PLACE_DETAIL_FACILITY_BADGE_CLASS}>
                      <Truck className="h-3.5 w-3.5" />
                      {page.t("placeDetail.facilities.delivery")}
                    </Badge>
                  )}
                  {place.hasDriveThrough && (
                    <Badge variant="outline" className={PLACE_DETAIL_FACILITY_BADGE_CLASS}>
                      <Car className="h-3.5 w-3.5" />
                      {page.t("placeDetail.facilities.driveThrough")}
                    </Badge>
                  )}
                  {place.parkingAvailable && (
                    <Badge variant="outline" className={PLACE_DETAIL_FACILITY_BADGE_CLASS}>
                      <ParkingSquare className="h-3.5 w-3.5" />
                      {page.t("placeDetail.facilities.parking")}
                    </Badge>
                  )}
                  {place.lotParking && (
                    <Badge variant="outline" className={PLACE_DETAIL_FACILITY_BADGE_CLASS}>
                      <ParkingSquare className="h-3.5 w-3.5" />
                      {page.t("placeDetail.facilities.lotParking")}
                    </Badge>
                  )}
                  {place.streetParking && (
                    <Badge variant="outline" className={PLACE_DETAIL_FACILITY_BADGE_CLASS}>
                      <ParkingSquare className="h-3.5 w-3.5" />
                      {page.t("placeDetail.facilities.streetParking")}
                    </Badge>
                  )}
                  {place.valetParking && (
                    <Badge variant="outline" className={PLACE_DETAIL_FACILITY_BADGE_CLASS}>
                      <ParkingSquare className="h-3.5 w-3.5" />
                      {page.t("placeDetail.facilities.valetParking")}
                    </Badge>
                  )}
                  {place.garageParking && (
                    <Badge variant="outline" className={PLACE_DETAIL_FACILITY_BADGE_CLASS}>
                      <ParkingSquare className="h-3.5 w-3.5" />
                      {page.t("placeDetail.facilities.garageParking")}
                    </Badge>
                  )}
                  {place.multiStoreyParking && (
                    <Badge variant="outline" className={PLACE_DETAIL_FACILITY_BADGE_CLASS}>
                      <ParkingSquare className="h-3.5 w-3.5" />
                      {page.t("placeDetail.facilities.multiStoreyParking")}
                    </Badge>
                  )}
                  {(place.seatingType ?? []).map((seat) => (
                    <Badge
                      key={seat}
                      variant="outline"
                      className={PLACE_DETAIL_FACILITY_BADGE_CLASS}
                    >
                      {seat === "indoor"
                        ? page.t("placeDetail.facilities.indoorSeating")
                        : page.t("placeDetail.facilities.outdoorSeating")}
                    </Badge>
                  ))}
                  {chrome.acceptsAnyPayment && (
                    <Badge variant="outline" className={PLACE_DETAIL_FACILITY_BADGE_CLASS}>
                      <CreditCard className="h-3.5 w-3.5" />
                      {page.t("placeDetail.facilities.cardPayment")}
                    </Badge>
                  )}
                  {place.acceptsNfcMobile && (
                    <Badge variant="outline" className={PLACE_DETAIL_FACILITY_BADGE_CLASS}>
                      <Smartphone className="h-3.5 w-3.5" />
                      {page.t("placeDetail.facilities.nfcPayment")}
                    </Badge>
                  )}
                  {chrome.hasWheelchairAccess && (
                    <Badge variant="outline" className={PLACE_DETAIL_FACILITY_BADGE_CLASS}>
                      <Accessibility className="h-3.5 w-3.5" />
                      {page.t("placeDetail.badge.accessible")}
                    </Badge>
                  )}
                  {place.assistiveHearingLoop && (
                    <Badge variant="outline" className={PLACE_DETAIL_FACILITY_BADGE_CLASS}>
                      <Ear className="h-3.5 w-3.5" />
                      {page.t("placeDetail.facilities.hearingLoop")}
                    </Badge>
                  )}
                </div>
              </Card>
            )}
          </div>

          <Card className="rounded-2xl border-border/70 bg-card/95 p-4 shadow-sm space-y-4 sm:p-5 max-w-full overflow-hidden">
            <h2 className="pd-type-kicker text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-accent" />
              {page.t("placeDetail.reviews.title")}
            </h2>

            <Tabs
              value={page.activeReviewTab}
              onValueChange={page.selectReviewTab}
              className="w-full"
            >
              <TabsList className="w-full bg-muted/60 grid grid-cols-2 h-auto p-1 gap-1">
                <TabsTrigger
                  value="website"
                  className="min-h-11 flex flex-col items-center justify-center gap-0.5 px-1 py-2 text-center leading-tight text-[0.6875rem] sm:flex-row sm:gap-1.5 sm:px-3 sm:text-sm"
                >
                  <Star className="h-3.5 w-3.5 shrink-0" />
                  <span className="pd-type-number break-words min-w-0">
                    {page.t("placeDetail.reviews.usersShort", {
                      count: page.formatNumber(chrome.websiteTotalCount),
                    })}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="social"
                  className="min-h-11 flex flex-col items-center justify-center gap-0.5 px-1 py-2 text-center leading-tight text-[0.6875rem] sm:flex-row sm:gap-1.5 sm:px-3 sm:text-sm"
                >
                  <Globe className="h-3.5 w-3.5 shrink-0" />
                  <span className="pd-type-number break-words min-w-0">
                    {page.t("placeDetail.reviews.socialShort", {
                      count: chrome.socialCountCompact,
                    })}
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="website" className="space-y-4 mt-4">
                {page.myReviewLoading ? (
                  <p className="pd-type-micro text-muted-foreground">
                    {page.t("placeDetail.reviews.loadingYourReview")}
                  </p>
                ) : page.myReview ? (
                  <Alert className="border-accent/35 bg-accent/10 text-accent">
                    <AlertDescription className="pd-type-label">
                      {page.t("placeDetail.reviews.alreadyReviewed")}
                    </AlertDescription>
                  </Alert>
                ) : null}

                <Suspense
                  fallback={
                    <Card className="rounded-2xl border-border/70 bg-card/95 p-5 space-y-3 animate-pulse">
                      <div className="h-5 bg-muted rounded w-1/3" />
                      <div className="h-11 bg-muted rounded" />
                      <div className="h-20 bg-muted rounded" />
                    </Card>
                  }
                >
                  {!chrome.isPrivilegedUser && (
                    <AddReviewFormLazy
                      key={`${page.myReview?.id ?? "create"}-${page.myReview?.createdAt ?? "none"}-${page.myReview ? "edit" : "create"}`}
                      onSubmit={page.handleSubmitReview}
                      submitting={page.submittingReview}
                      submitted={page.reviewSubmitted}
                      mode={page.myReview ? "edit" : "create"}
                      initialRating={page.myReview?.rating ?? 0}
                      initialComment={page.myReview?.comment ?? ""}
                      onDelete={
                        page.myReview ? page.handleDeleteMyReview : undefined
                      }
                      deleting={page.deletingReview || page.reportingReview}
                      errorMessage={page.reviewActionError}
                    />
                  )}
                </Suspense>

                {page.reviewsLoading ? (
                  <ReviewSkeleton />
                ) : page.reviewsError ? (
                  <Alert variant="destructive" className="border-destructive/30">
                    <AlertTitle>{page.t("placeDetail.reviews.userError")}</AlertTitle>
                    <AlertDescription className="mt-2 flex flex-wrap items-center justify-between gap-3">
                      <span className="break-words">{page.reviewsError}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void page.retryReviewsLoad()}
                      >
                        {page.t("common.retry")}
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : page.reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="pd-type-body text-muted-foreground">
                      {page.t("placeDetail.reviews.empty")}
                    </p>
                  </div>
                ) : (
                  <div
                    className="space-y-3"
                    style={{ contentVisibility: "auto" }}
                  >
                    <Suspense fallback={<ReviewSkeleton />}>
                      {page.reviews.map((review) => (
                        <ReviewCardLazy
                          key={review.id}
                          review={review}
                          alreadyReported={page.isReviewReported(review.id)}
                          onReport={
                            page.currentUserId &&
                            review.userId === page.currentUserId
                              ? undefined
                              : page.handleReportReview
                          }
                        />
                      ))}
                    </Suspense>

                    {page.reviewsPagination.totalPages > 1 && (
                      <ReviewsPagination
                        pageIndex={page.reviewsPagination.pageIndex}
                        totalPages={page.reviewsPagination.totalPages}
                        totalCount={page.reviewsPagination.totalCount}
                        pageSize={page.reviewsPagination.pageSize}
                        loading={page.loadingMoreReviews}
                        onPageChange={page.goToReviewsPage}
                        className="pt-1"
                      />
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="social" className="space-y-4 mt-4">
                <Alert className="border-border/70 bg-muted/40">
                  <AlertDescription className="pd-type-label text-muted-foreground flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 shrink-0" />
                    <span>{page.t("placeDetail.reviews.socialDescription")}</span>
                  </AlertDescription>
                </Alert>

                {page.socialReviewsLoading ? (
                  <ReviewSkeleton />
                ) : page.socialReviewsError ? (
                  <Alert variant="destructive" className="border-destructive/30">
                    <AlertTitle>
                      {page.t("placeDetail.reviews.socialError")}
                    </AlertTitle>
                    <AlertDescription className="mt-2 flex flex-wrap items-center justify-between gap-3">
                      <span className="break-words">{page.socialReviewsError}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void page.retrySocialReviewsLoad()}
                      >
                        {page.t("common.retry")}
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : page.socialReviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Globe className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="pd-type-body text-muted-foreground">
                      {page.t("placeDetail.reviews.socialEmpty")}
                    </p>
                  </div>
                ) : (
                  <div
                    className="space-y-3"
                    style={{ contentVisibility: "auto" }}
                  >
                    <Suspense fallback={<ReviewSkeleton />}>
                      {page.socialReviews.map((review) => (
                        <SocialReviewCardLazy key={review.id} review={review} />
                      ))}
                    </Suspense>

                    {page.socialReviewsPagination.totalPages > 1 && (
                      <ReviewsPagination
                        pageIndex={page.socialReviewsPagination.pageIndex}
                        totalPages={page.socialReviewsPagination.totalPages}
                        totalCount={page.socialReviewsPagination.totalCount}
                        pageSize={page.socialReviewsPagination.pageSize}
                        loading={page.loadingMoreSocialReviews}
                        onPageChange={page.goToSocialReviewsPage}
                        className="pt-1"
                      />
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>

          <Button
            className="hidden sm:inline-flex min-h-12 font-semibold gap-2 sm:w-auto sm:min-w-[260px]"
            onClick={page.openInMaps}
            disabled={!page.canOpenInMaps}
          >
            <ExternalLink className="h-4 w-4" />
            {page.t("placeDetail.action.openMaps")}
          </Button>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:hidden">
        <div className="mx-auto w-full max-w-6xl px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <Button
            className="w-full min-h-12 font-semibold gap-2"
            onClick={page.openInMaps}
            disabled={!page.canOpenInMaps}
          >
            <ExternalLink className="h-4 w-4" />
            {page.t("placeDetail.action.openMaps")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailPage;
