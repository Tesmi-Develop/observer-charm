local patch = require(script.Parent.patch)

local function SyncAtoms(payload, atoms, mapType)
	for key, state in payload.data do
		if payload.type == "patch" then
			atoms[key](patch.apply(atoms[key](), state, mapType))
		else
			atoms[key](state)
		end
	end
end

return {
	SyncAtoms = SyncAtoms;
}