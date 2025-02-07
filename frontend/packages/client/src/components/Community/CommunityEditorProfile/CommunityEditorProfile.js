import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { ActionButton } from 'components';
import { yupResolver } from '@hookform/resolvers/yup';
import { ProfileSchema, initialValues } from './FormConfig';
import ProfileForm from './ProfileForm';

// map to match server fields for updating
const ServerFieldsMap = {
  communityName: 'name',
  communityDescription: 'body',
  communityCategory: 'category',
  communityTerms: 'termsAndConditionsUrl',
  banner: 'bannerImgUrl',
  logo: 'logo',
};

export default function CommunityEditorProfile({
  name,
  body = '',
  logo,
  banner,
  category,
  terms,
  // fn to update community payload
  updateCommunity,
  // fn to upload image
  uploadFile,
} = {}) {
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const [isUpdatingBanner, setIsUpdatingBanner] = useState(false);

  const { register, handleSubmit, formState, control, setValue, reset } =
    useForm({
      defaultValues: {
        ...initialValues,
        communityName: name,
        communityDescription: body,
        communityCategory: category,
        logo: logo ? { imageUrl: logo, cropped: true } : undefined,
        banner: banner ? { imageUrl: banner, cropped: true } : undefined,
        communityTerms: terms,
      },
      resolver: yupResolver(ProfileSchema),
    });

  const logoField = useWatch({ control, name: 'logo' });
  const bannerField = useWatch({ control, name: 'banner' });

  const { errors, isSubmitting, isDirty, dirtyFields } = formState;

  // reset form after update with new props passed updated
  useEffect(() => {
    reset({}, { keepValues: true, keepDirty: false });
  }, [name, body, category, logo, banner, terms, reset]);

  const onSubmit = async (data) => {
    const fieldsToUpdate = Object.keys(dirtyFields);

    // get all fields that were updated
    const updates = Object.assign(
      {},
      ...fieldsToUpdate.map((field) => ({
        [ServerFieldsMap[field]]: data[field],
      }))
    );

    // logo and banner images need to be uploaded and
    // url needs to be sent to backend to update
    if (updates?.logo?.file) {
      setIsUpdatingImage(true);
      // onError hook from react-query will handle error
      const uploadImg = await uploadFile(data?.logo?.file).catch(() => {
        console.error('Error uploading logo image');
        return;
      });
      updates.logo = uploadImg?.fileUrl ?? undefined;
    }
    if (updates?.bannerImgUrl?.file) {
      setIsUpdatingBanner(true);
      // onError hook from react-query will handle error
      const uploadBanner = await uploadFile(data?.banner?.file).catch(() => {
        console.error('Error uploading banner image');
        return;
      });
      updates.bannerImgUrl = uploadBanner?.fileUrl ?? undefined;
    }

    // updated fields
    if (Object.keys(updates).length > 0) {
      // onError hook from react-query will handle error
      await updateCommunity(updates).catch(() => {
        return;
      });
    }
    // call if value as true
    setIsUpdatingImage(false);
    setIsUpdatingBanner(false);
  };

  return (
    <ProfileForm
      submitComponent={
        <ActionButton
          type="submit"
          label="Save"
          enabled={isDirty && !isSubmitting}
          loading={isSubmitting}
          classNames="vote-button transition-all has-background-yellow mt-5"
        />
      }
      errors={errors}
      register={register}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit(onSubmit)}
      setValue={setValue}
      logoImage={logoField}
      bannerImage={bannerField}
      control={control}
      isUpdatingLogo={isUpdatingImage}
      isUpdatingBanner={isUpdatingBanner}
    />
  );
}
