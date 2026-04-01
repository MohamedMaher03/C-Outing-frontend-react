import type {
  PlaceFormData,
  PlaceFormErrors,
  CreateAdminPlaceInput,
} from "../types";

export const EMPTY_PLACE_FORM: PlaceFormData = {
  name: "",
  category: "",
  district: "",
  description: "",
  whyRecommend: "",
  priceLevel: "mid_range",
  tags: [],
  image: "",
  phone: "",
  website: "",
};

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1200;
const MAX_WHY_RECOMMEND_LENGTH = 600;
const MAX_PHONE_LENGTH = 30;

const isValidUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const isReasonablePhone = (value: string): boolean => {
  return /^[+()\-\s\d]{6,30}$/.test(value);
};

type PlaceFormTranslator = (
  key: string,
  values?: Record<string, string | number>,
  fallback?: string,
) => string;

export const validatePlaceForm = (
  form: PlaceFormData,
  translate?: PlaceFormTranslator,
): PlaceFormErrors => {
  const message = (
    key: string,
    fallback: string,
    values?: Record<string, string | number>,
  ): string => {
    if (!translate) {
      return fallback;
    }

    return translate(key, values, fallback);
  };

  const errors: PlaceFormErrors = {};
  const normalizedName = form.name.trim();
  const normalizedDescription = form.description.trim();
  const normalizedImage = form.image.trim();
  const normalizedPhone = form.phone.trim();
  const normalizedWebsite = form.website.trim();
  const normalizedWhyRecommend = form.whyRecommend.trim();

  if (!normalizedName) {
    errors.name = message(
      "admin.places.form.error.nameRequired",
      "Place name is required.",
    );
  } else if (normalizedName.length > MAX_NAME_LENGTH) {
    errors.name = message(
      "admin.places.form.error.nameMax",
      `Place name must be ${MAX_NAME_LENGTH} characters or less.`,
      { max: MAX_NAME_LENGTH },
    );
  }

  if (!form.category) {
    errors.category = message(
      "admin.places.form.error.categoryRequired",
      "Please select a category.",
    );
  }

  if (!form.district) {
    errors.district = message(
      "admin.places.form.error.districtRequired",
      "Please select a district.",
    );
  }

  if (!normalizedDescription) {
    errors.description = message(
      "admin.places.form.error.descriptionRequired",
      "Description is required.",
    );
  } else if (normalizedDescription.length < 20) {
    errors.description = message(
      "admin.places.form.error.descriptionMin",
      "Description must be at least 20 characters.",
      { min: 20 },
    );
  } else if (normalizedDescription.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = message(
      "admin.places.form.error.descriptionMax",
      `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less.`,
      { max: MAX_DESCRIPTION_LENGTH },
    );
  }

  if (!normalizedImage) {
    errors.image = message(
      "admin.places.form.error.imageRequired",
      "Image URL is required.",
    );
  } else if (!isValidUrl(normalizedImage)) {
    errors.image = message(
      "admin.places.form.error.imageUrlInvalid",
      "Image URL must start with http:// or https://.",
    );
  }

  if (
    normalizedWhyRecommend &&
    normalizedWhyRecommend.length > MAX_WHY_RECOMMEND_LENGTH
  ) {
    errors.whyRecommend = message(
      "admin.places.form.error.whyRecommendMax",
      `Why recommend must be ${MAX_WHY_RECOMMEND_LENGTH} characters or less.`,
      { max: MAX_WHY_RECOMMEND_LENGTH },
    );
  }

  if (normalizedPhone) {
    if (normalizedPhone.length > MAX_PHONE_LENGTH) {
      errors.phone = message(
        "admin.places.form.error.phoneMax",
        `Phone number must be ${MAX_PHONE_LENGTH} characters or less.`,
        { max: MAX_PHONE_LENGTH },
      );
    } else if (!isReasonablePhone(normalizedPhone)) {
      errors.phone = message(
        "admin.places.form.error.phoneInvalid",
        "Phone number contains unsupported characters or format.",
      );
    }
  }

  if (normalizedWebsite && !isValidUrl(normalizedWebsite)) {
    errors.website = message(
      "admin.places.form.error.websiteUrlInvalid",
      "Website URL must start with http:// or https://.",
    );
  }

  return errors;
};

export const toCreatePlaceInput = (
  form: PlaceFormData,
): CreateAdminPlaceInput => ({
  name: form.name.trim(),
  category: form.category,
  district: form.district,
  image: form.image.trim(),
  tags: Array.from(new Set(form.tags.map((tag) => tag.trim()).filter(Boolean))),
  description: form.description.trim(),
  whyRecommend: form.whyRecommend.trim(),
  priceLevel: form.priceLevel,
  phone: form.phone.trim(),
  website: form.website.trim(),
});
