import { joiResolver } from '@hookform/resolvers/joi';
import { Add, DriveFileRenameOutline } from '@mui/icons-material';
import DatePicker from '@mui/lab/DatePicker';
import { Button, TextField } from '@mui/material';
import { SectionPath, WorkExperience } from '@reactive-resume/schema';
import dayjs from 'dayjs';
import Joi from 'joi';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import BaseModal from '@/components/shared/BaseModal';
import MarkdownSupported from '@/components/shared/MarkdownSupported';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setModalState } from '@/store/modal/modalSlice';
import { addItem, editItem } from '@/store/resume/resumeSlice';

type FormData = WorkExperience;

const path: SectionPath = 'sections.work';

const defaultState: FormData = {
  name: '',
  position: '',
  date: {
    start: '',
    end: '',
  },
  url: '',
  summary: '',
};

const schema = Joi.object<FormData>().keys({
  id: Joi.string(),
  name: Joi.string().required(),
  position: Joi.string().required(),
  date: Joi.object().keys({
    start: Joi.string().allow(''),
    end: Joi.string().allow(''),
  }),
  url: Joi.string()
    .pattern(/[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/, { name: 'valid URL' })
    .allow(''),
  summary: Joi.string().allow(''),
});

const WorkModal: React.FC = () => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const heading = useAppSelector((state) => get(state.resume, `${path}.name`));
  const { open: isOpen, payload } = useAppSelector((state) => state.modal[`builder.${path}`]);

  const item: FormData = get(payload, 'item', null);
  const isEditMode = useMemo(() => !!item, [item]);

  const addText = useMemo(() => t('builder.common.actions.add', { token: heading }), [t, heading]);
  const editText = useMemo(() => t('builder.common.actions.edit', { token: heading }), [t, heading]);

  const { reset, control, handleSubmit } = useForm<FormData>({
    defaultValues: defaultState,
    resolver: joiResolver(schema),
  });

  const onSubmit = (formData: FormData) => {
    if (isEditMode) {
      dispatch(editItem({ path: `${path}.items`, value: formData }));
    } else {
      dispatch(addItem({ path: `${path}.items`, value: formData }));
    }

    handleClose();
  };

  const handleClose = () => {
    dispatch(
      setModalState({
        modal: `builder.${path}`,
        state: { open: false },
      })
    );

    reset(defaultState);
  };

  useEffect(() => {
    if (!isEmpty(item)) {
      reset(item);
    }
  }, [item, reset]);

  return (
    <BaseModal
      icon={isEditMode ? <DriveFileRenameOutline /> : <Add />}
      isOpen={isOpen}
      handleClose={handleClose}
      heading={isEditMode ? editText : addText}
      footerChildren={<Button onClick={handleSubmit(onSubmit)}>{isEditMode ? editText : addText}</Button>}
    >
      <form className="my-2 grid grid-cols-2 gap-4">
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              required
              autoFocus
              label={t('builder.common.form.name.label')}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="position"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              required
              label={t('builder.common.form.position.label')}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="date.start"
          control={control}
          render={({ field, fieldState }) => (
            <DatePicker
              {...field}
              openTo="year"
              label={t('builder.common.form.start-date.label')}
              views={['year', 'month', 'day']}
              onChange={(date: Date, keyboardInputValue: string) => {
                isEmpty(keyboardInputValue) && field.onChange('');
                dayjs(date).isValid() && field.onChange(date.toISOString());
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message || params.inputProps?.placeholder}
                />
              )}
            />
          )}
        />

        <Controller
          name="date.end"
          control={control}
          render={({ field, fieldState }) => (
            <DatePicker
              {...field}
              openTo="year"
              label={t('builder.common.form.end-date.label')}
              views={['year', 'month', 'day']}
              onChange={(date: Date, keyboardInputValue: string) => {
                isEmpty(keyboardInputValue) && field.onChange('');
                dayjs(date).isValid() && field.onChange(date.toISOString());
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message || t('builder.common.form.end-date.help-text')}
                />
              )}
            />
          )}
        />

        <Controller
          name="url"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              label={t('builder.common.form.url.label')}
              className="col-span-2"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="summary"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              multiline
              minRows={3}
              maxRows={6}
              label={t('builder.common.form.summary.label')}
              className="col-span-2"
              error={!!fieldState.error}
              helperText={fieldState.error?.message || <MarkdownSupported />}
              {...field}
            />
          )}
        />
      </form>
    </BaseModal>
  );
};

export default WorkModal;