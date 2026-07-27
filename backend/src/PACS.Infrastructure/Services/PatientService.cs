public async Task<PagedResult<PatientResponse>> SearchAsync(PatientSearchQuery query)
{
    var q = _db.Patients
        .AsNoTracking()
        .Where(p => !p.IsDeleted);

    if (!string.IsNullOrWhiteSpace(query.Name))
    {
        var search = query.Name.Trim().ToLower();

        q = q.Where(p =>
            p.FirstName.ToLower().Contains(search) ||
            p.LastName.ToLower().Contains(search));
    }

    if (!string.IsNullOrWhiteSpace(query.PatientNumber))
    {
        q = q.Where(p => p.PatientNumber == query.PatientNumber);
    }

    if (!string.IsNullOrWhiteSpace(query.NationalId))
    {
        q = q.Where(p => p.NationalId == query.NationalId);
    }

    var total = await q.CountAsync();

    var items = await q
        .OrderBy(p => p.LastName)
        .Skip((query.Page - 1) * query.PageSize)
        .Take(query.PageSize)
        .Select(p => new PatientResponse(
            p.Id,
            p.PatientNumber,
            p.FirstName,
            p.LastName,
            p.DateOfBirth,
            p.Gender,
            p.PhoneNumber,
            p.Email,
            p.InsuranceProvider,
            p.CreatedAtUtc))
        .ToListAsync();

    return new PagedResult<PatientResponse>(
        items,
        total,
        query.Page,
        query.PageSize);
}
