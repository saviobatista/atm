import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { Aircraft } from "./Aircraft";

@Entity()
export class Radar {
  // @OneToOne(()=>Aircraft)
  // @JoinColumn()
  @PrimaryColumn({ type: "varchar", length: 6 })
  hex: string;

  @PrimaryColumn({ type: "date" })
  date: Date;

  @Column({ type: "varchar", length: 10, nullable: true })
  callsign?: string;

  @Column("int", { nullable: true })
  altitude?: number;

  @Column("smallint", { nullable: true })
  speed?: number;

  @Column({ type: "smallint", nullable: true })
  track?: number;

  @Column({
    type: "geography",
    nullable: true,
    spatialFeatureType: "point",
    srid: 4326,
  })
  position?: string;

  @Column("smallint", { nullable: true })
  vertical?: number;

  @Column("bit", { nullable: true })
  ground?: boolean;
}
