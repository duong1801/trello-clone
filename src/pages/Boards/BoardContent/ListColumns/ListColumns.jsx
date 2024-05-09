/** @format */
import Box from "@mui/material/Box"
import Column from "./Column/Column"
import Button from "@mui/material/Button"
import AddBoxIcon from "@mui/icons-material/AddBox"
import {
	SortableContext,
	horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
function ListColumns({ columns }) {
	return (
		<SortableContext
			items={columns?.map((column) => column._id)}
			strategy={horizontalListSortingStrategy}>
			<Box
				sx={{
					bgcolor: "inherit",
					width: "100%",
					height: "100%",
					display: "flex",
					overflowX: "hidden",
					overflowY: "hidden",
				}}>
				{columns?.map((column) => (
					<Column column={column} key={column._id} />
				))}
				<Box
					sx={{
						minWidth: "200px",
						maxWidth: "200px",
						mx: 2,
						borderRadius: "6px",
						height: "fit-content",
						bgcolor: "#ffffff3d",
					}}>
					<Button
						sx={{
							color: "white",
							width: "100%",
							justifyContent: "flex-start",
							pl: 2.5,
							py: 1,
						}}
						startIcon={<AddBoxIcon />}>
						Add new column
					</Button>
				</Box>
			</Box>
		</SortableContext>
	)
}

export default ListColumns
