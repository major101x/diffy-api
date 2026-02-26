import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  body: string;

  @IsNotEmpty()
  @IsString()
  filePath: string;

  @IsNotEmpty()
  @IsNumber()
  lineNumber: number;

  @IsNotEmpty()
  @IsNumber()
  pullRequestId: number;
}
