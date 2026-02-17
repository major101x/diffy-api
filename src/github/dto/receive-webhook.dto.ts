import { IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class InstallationDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class SenderDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class ReceiveWebhookDto {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => InstallationDto)
  installation: InstallationDto;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => SenderDto)
  sender: SenderDto;
}
