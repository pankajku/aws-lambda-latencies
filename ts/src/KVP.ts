import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class KVP {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 45, unique: true })
  key: string;

  @Column({ type: 'text'})
  value: string;
}
