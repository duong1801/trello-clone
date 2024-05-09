/** @format */
import Box from "@mui/material/Box"
import Card from "./Card/Card"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
function ListCards({ cards }) {
	return (
		<SortableContext
			items={cards?.map((card) => card._id)}
			strategy={verticalListSortingStrategy}>
			<Box
				sx={{
					height: "fit-content",
					maxHeight: (theme) =>
						`calc(${theme.trello.boardContentHeight} - ${
							theme.trello.columnHeaderHeight
						} - ${theme.trello.columnFooterHeight} -
						${theme.spacing(5)}
						)`,
					gap: 1,
					overflowX: "hidden",
					overflowY: "auto",
					p: 2,
					display: "flex",
					flexDirection: "column",
				}}>
				{cards?.map((card) => (
					<Card card={card} key={card._id} />
				))}
			</Box>
		</SortableContext>
	)
}

export default ListCards
