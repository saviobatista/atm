import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class Aircraft {
  @PrimaryColumn({ type: "varchar", length: 6 })
  hex: string;

  @Column({ type: "varchar", length: 10, nullable: true })
  type?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  registration?: string;
}
