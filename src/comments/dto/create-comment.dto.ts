import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

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
  @IsString()
  pullRequestId: string;

  @IsNumber()
  @IsOptional()
  parentCommentId?: number;
}
