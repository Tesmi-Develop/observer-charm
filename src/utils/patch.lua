-- https://github.com/littensy/charm/blob/main/src/sync/patch.luau

--[=[
	A special value that denotes the absence of a value. Used to represent
	undefined values in patches.
]=]
local NONE = { __none = "__none" }

local function diff(prevState: { [any]: any }, nextState: { [any]: any })
	local patches = table.clone(nextState)

	for key, previous in prevState do
		local next = nextState[key]

		if previous == next then
			patches[key] = nil
		elseif next == nil then
			patches[key] = NONE
		elseif type(previous) == "table" and type(next) == "table" then
			patches[key] = diff(previous, next)
		end
	end

	return patches
end

local function apply(state: any, patches: any): any
	if type(patches) == "table" and patches.__none == "__none" then
		return nil
	elseif type(state) ~= "table" or type(patches) ~= "table" then
		return patches
	end

	local nextState = table.clone(state)
	local stateIsArray = state[1] ~= nil

	for key, patch in patches do
		-- Diff-checking an array produces a sparse array, which will not be
		-- preserved when converted to JSON. To prevent this, we turn string
		-- keys back into numeric keys.
		if stateIsArray and type(key) == "string" then
			key = tonumber(key) or key
		end

		nextState[key] = apply(nextState[key], patch)
	end

	return nextState
end

return {
	NONE = NONE,
	diff = diff,
	apply = apply,
}