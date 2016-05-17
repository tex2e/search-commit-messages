
target_file = ARGV[0]

lines = []

File.open(target_file, "r") do |f|
  lines = f.each_line.to_a;
  lines.reject! do |line|
    line.length <= 10 ||
    line.length >= 100 ||
    line.match(/https?:|git:|github\.com:/) ||
    line.count("-0-9_ ,.: `'\"\/,.:`*+()#") / line.length.to_f >= 0.4  # more than 40% symbols
  end
end

File.open(target_file, "w") do |f|
  f.write(lines.join())
end
