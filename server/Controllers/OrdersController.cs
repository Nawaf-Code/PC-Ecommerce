using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging; // Ensure you have this using directive
using Newtonsoft.Json;
using server.Data;
using server.DTOs;
using Stripe;

namespace server.Controllers;

public class OrdersController : BaseController
{
    private readonly CommerceContext _context;
    private readonly IConfiguration _configuration;
     private readonly UserManager<User> userManager;
    private readonly ILogger<OrdersController> _logger; // Define a logger

    // Adjust the constructor to inject the logger
    public OrdersController(
        CommerceContext context,
        IConfiguration configuration,
        UserManager<User> userManager,
        ILogger<OrdersController> logger // Inject ILogger here
    )
    {
        _context = context;
        _configuration = configuration;
       this.userManager = userManager;
        _logger = logger; // Initialize the logger
    }

    // api/orders/
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult> GetOrders(
        [FromQuery] int? orderId,
        [FromQuery] string? sort,
        [FromQuery] int pn = 1
    )
    {
        const int pageSize = 10;

        var query = _context.Orders.AsQueryable();

        if (orderId.HasValue)
        {
            query = query.Where(q => q.Id == orderId);
        }

        switch (sort)
        {
            case "priceAsc":
                query = query.OrderBy(q => q.OrderTotal);
                break;
            case "priceDesc":
                query = query.OrderByDescending(q => q.OrderTotal);
                break;
            case "dateAsc":
                query = query.OrderBy(q => q.OrderDate);
                break;
            default:
                // Default sorting: latest orders (dateDesc)
                query = query.OrderByDescending(q => q.OrderDate);
                break;
        }

        var totalOrders = await query.CountAsync();

        var orders = await query
            .Skip((pn - 1) * pageSize)
            .Take(pageSize)
            .Include(o => o.Address)
            .ToListAsync();

        var orderDTOs = new List<OrderDTO>();

        foreach (var order in orders)
        {
            var orderItemDTOs = await _context.OrderItems
                .Where(i => i.OrderId == order.Id)
                .Include(i => i.Product)
                .Select(
                    item =>
                        new OrderItemDTO
                        {
                            Brand = item.Product.Brand,
                            Name = item.Product.Name,
                            ImageSrc =
                                item.Product.Images != null && item.Product.Images.Any()
                                    ? item.Product.Images.First().src
                                    : "/assets/logo.png",
                            ImageAlt =
                                item.Product.Images != null && item.Product.Images.Any()
                                    ? item.Product.Images.First().alt
                                    : item.Product.Brand,
                            Color = item.Color,
                            Size = item.Size,
                            Price = item.Price,
                            Quantity = item.Quantity
                        }
                )
                .ToListAsync();

            orderDTOs.Add(
                new OrderDTO
                {
                    OrderID = order.Id,
                    OrderDate = order.OrderDate,
                    OrderStatus = order.OrderStatus,
                    OrderTotal = order.OrderTotal,
                    OrderInvoice = order.OrderInvoice,
                    OrderTrace = order.OrderTrace,
                    Address = new AddressDTO
                    {
                        FullName = order.Address.FullName,
                        ContactNumber = order.Address.ContactNumber,
                        Country = order.Address.Country,
                        City = order.Address.City,
                        AddressLine = order.Address.AddressLine,
                        AddressLineSecond = order.Address.AddressLineSecond
                    },
                    OrderItems = orderItemDTOs
                }
            );
        }

        return Ok(
            new
            {
                PageSize = pageSize,
                PageNumber = pn,
                TotalOrders = totalOrders,
                Orders = orderDTOs
            }
        );
    }

    // api/orders/add
[HttpPost("add")]
public async Task<ActionResult<OrderDTO>> AddOrder([FromBody] OrderCreateRequest orderRequest)
{
    try
    {
        _logger.LogInformation("Attempting to create an order with payment intent: {PaymentIntent}", orderRequest.PaymentIntent);

        if (orderRequest == null)
        {
            _logger.LogWarning("Order request is null.");
            return BadRequest("Invalid order data.");
        }

        if (orderRequest.User?.Email == null)
        {
            _logger.LogWarning("User email is not provided in the order request.");
            return BadRequest("User email is required.");
        }

        if (orderRequest.Products == null || !orderRequest.Products.Any())
        {
            _logger.LogWarning("No products provided in the order.");
            return BadRequest("Products are required to create an order.");
        }

        var user = await userManager.Users
                                     .Include(u => u.Address)
                                     .SingleOrDefaultAsync(u => u.Email == orderRequest.User.Email);

        if (user == null)
        {
            _logger.LogWarning("User with email {Email} not found.", orderRequest.User.Email);
            return BadRequest("User not found.");
        }

        if (user.Address == null)
        {
            _logger.LogWarning("User with email {Email} does not have a valid address.", orderRequest.User.Email);
            return BadRequest("User address is required.");
        }

        var products = new List<OrderItem>();

        foreach (var product in orderRequest.Products)
        {
            var productEntity = await _context.Products
                                              .Include(p => p.Images) // Ensure images are loaded
                                              .FirstOrDefaultAsync(p => p.Id == product.ProductId);
            if (productEntity == null)
            {
                _logger.LogWarning("Product with ID {ProductId} not found.", product.ProductId);
                return BadRequest($"Product with ID {product.ProductId} not found.");
            }

            products.Add(new OrderItem
            {
                ProductId = product.ProductId,
                Price = product.Price,
                Quantity = product.Quantity,
                Color = "Default Color", // Ensure these properties are correctly handled
                Size = "Default Size"
            });
        }

        var order = new Order
        {
            UserID = user.Id,
            OrderDate = DateTime.Now.ToString("19/5/2024 1:20:46"),
            OrderStatus = "Preparing",
            AddressID = user.Address.Id,
            OrderTotal = orderRequest.Products.Sum(p => p.Price * p.Quantity),
            OrderInvoice = orderRequest.PaymentIntent,
            OrderItems = products
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        var orderDTO = new OrderDTO
        {
            OrderID = order.Id,
            OrderDate = order.OrderDate,
            OrderStatus = order.OrderStatus,
            OrderTotal = order.OrderTotal,
            OrderInvoice = order.OrderInvoice,
            Address = new AddressDTO
            {
                FullName = user.Address.FullName,
                ContactNumber = user.Address.ContactNumber,
                Country = user.Address.Country,
                City = user.Address.City,
                AddressLine = user.Address.AddressLine,
                AddressLineSecond = user.Address.AddressLineSecond
            },
            OrderItems = order.OrderItems.Select(i => new OrderItemDTO
            {
                Brand = i.Product?.Brand ?? "Default Brand",
                Name = i.Product?.Name ?? "Default Product",
                ImageSrc = i.Product?.Images.FirstOrDefault()?.src ?? "/path/to/default-image.png",
                ImageAlt = i.Product?.Images.FirstOrDefault()?.alt ?? "Default Image",
                Price = i.Price,
                Quantity = i.Quantity,
                Color = i.Color ?? "Default Color",
                Size = i.Size ?? "Default Size"
            }).ToList()
        };

        _logger.LogInformation("Order {OrderId} created successfully for user {Email}.", orderDTO.OrderID, orderRequest.User.Email);
        return Ok(orderDTO);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "An error occurred while creating the order: {Message}", ex.Message);
        return BadRequest("Failed to create the order.");
    }
}
}

// Define the required DTOs for the order creation
public class OrderCreateRequest
{
    public string PaymentIntent { get; set; }
    public List<ProductOrderDTO> Products { get; set; }
    public UserOrderDTO User { get; set; }
}

public class ProductOrderDTO
{
    public int ProductId { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}

public class UserOrderDTO
{
    public string Email { get; set; }
    public AddressDTO Address { get; set; }
}