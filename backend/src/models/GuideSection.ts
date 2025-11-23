import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';

interface GuideSectionAttributes {
    id: number;
    sectionId: string; // e.g., 'intro', 'getting-started'
    title: string;
    content: string; // HTML content
    order: number;
    isVisible: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface GuideSectionCreationAttributes extends Optional<GuideSectionAttributes, 'id'> { }

class GuideSection extends Model<GuideSectionAttributes, GuideSectionCreationAttributes> implements GuideSectionAttributes {
    public id!: number;
    public sectionId!: string;
    public title!: string;
    public content!: string;
    public order!: number;
    public isVisible!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

GuideSection.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        sectionId: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        isVisible: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'guide_sections',
        timestamps: true,
    }
);

export default GuideSection;
