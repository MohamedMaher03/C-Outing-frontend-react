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

export const validatePlaceForm = (form: PlaceFormData): PlaceFormErrors => {
  const errors: PlaceFormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Place name is required.";
  }

  if (!form.category) {
    errors.category = "Please select a category.";
  }

  if (!form.district) {
    errors.district = "Please select a district.";
  }

  if (!form.description.trim()) {
    errors.description = "Description is required.";
  } else if (form.description.trim().length < 20) {
    errors.description = "Description must be at least 20 characters.";
  }

  if (!form.image.trim()) {
    errors.image = "Image URL is required.";
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
  tags: form.tags,
  description: form.description.trim(),
  whyRecommend: form.whyRecommend.trim(),
  priceLevel: form.priceLevel,
  phone: form.phone.trim(),
  website: form.website.trim(),
});
