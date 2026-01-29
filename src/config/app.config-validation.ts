import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PASSPORT_API_URL: Joi.string().uri().required(),
  PASSPORT_CLIENT_ID: Joi.string().required(),
  PASSPORT_CLIENT_SECRET: Joi.string().required(),
  PASSPORT_API_KEY: Joi.string().optional(),
  SECRET_API_KEY: Joi.string().optional(),
  PASSPORT_WEBHOOK_SECRET: Joi.string().optional(),
});

