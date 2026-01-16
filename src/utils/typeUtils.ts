import { TeamType } from "../Types"

export const invertTeam = (value: TeamType): TeamType => {
    return value === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE;
}
