import { BadRequestException } from '@nestjs/common';

const TIMEZONE_PATTERN = /(?:Z|[+-]\d{2}:?\d{2})$/i;

export function parseKickoffAt(value: string) {
  const text = value?.trim();

  if (!text) {
    throw new BadRequestException('Kickoff time is required');
  }

  const date = new Date(
    TIMEZONE_PATTERN.test(text) ? text : `${text}+05:30`,
  );

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException('Invalid kickoff time');
  }

  return date;
}
